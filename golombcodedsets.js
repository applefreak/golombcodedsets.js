// This is free and unencumbered software released into the public domain.

// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.

// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.

// For more information, please refer to <http://unlicense.org/>

// This is a refactored node package based on original implementation of https://github.com/rasky/gcs

var md5 = require('./md5');

function GCSBuilder(N, P, hash) {
  this._N = N;
  this._P = P;
  this._values = [0];
  this._hash = hash || function (w) { return parseInt(md5(w).substring(24, 32), 16); }; //Make 32bit slice of md5 hash
}

GCSBuilder.prototype = {
  _bitwriter: function (arr) {
    var accum = 0,
      n = 0,
      tmp = 0;

    function c(n2, v2) {
      if (n2 > 8) {
        n2 -= 8;
        tmp = v2 / Math.pow(2, n2) >>> 0;
        c(8, tmp);
        c(n2, v2 - tmp * Math.pow(2, n2));
      } else {
        accum = accum * Math.pow(2, n2) + v2;
        n += n2;
        if (n >= 8) {
          arr.push(accum / Math.pow(2, n - 8));
          n -= 8;
          accum = accum & ((1 << n) - 1);
        }
      }
    }

    c.close = function () {
      if (n !== 0) {
        accum = (accum << (8 - n)) & 255;
        arr.push(accum);
      }
    };

    return c;
  },
  _golombEnc: function (arr, P) {
    var logp = Math.round(Math.log(P) * Math.LOG2E);
    var f = this._bitwriter(arr);

    function c(v) {
      var q = ~~(v / P),
        r = v % P;
      f(q + 1, (1 << (q + 1)) - 2);
      f(logp, r);
      return;
    }

    c.close = function () {
      f.close();
    };

    c.write = f;

    return c;
  },
  add: function (w) {
    var h = this._hash(w) % (this._N * this._P);
    this._values.push(h);
  },
  finalize: function () {
    var i,
      d,
      ab,
      res = [],
      header = new Array(8),
      f = this._golombEnc(res, this._P);
    //this._values = quicksort(this._values);
    this._values.sort(function (a, b) { return a - b; });

    for (i = 0; i < this._values.length - 1; i += 1) {
      d = this._values[i + 1] - this._values[i];
      if (d === 0 && i > 0) {
        continue;
      }
      f(d);
    }
    f.close();

    res = header.concat(res);
    res = new Uint8Array(res);
    var dw = new DataView(res.buffer);
    dw.setUint32(0, this._N);
    dw.setUint32(4, this._P);
    return res.buffer;
  }
};


function GCSQuery(_arrBuff, hash) {
  var dw = new DataView(_arrBuff);
  this._N = dw.getUint32(0);
  this._P = dw.getUint32(4);
  this._u8arr = new Uint8Array(_arrBuff, 8);
  this._hash = hash || function (w) { return parseInt(md5(w).substring(24, 32), 16); }; //Make 32bit slice of md5 hash
}

GCSQuery.prototype = {
  _bitreader: function (arr) {
    var offset = 0,
      accum = 0,
      n = 0;

    function c(n2, v) {
      if (typeof v === 'undefined') v = 0;
      if (n2 > 8) {
        v = v * 256 + c(8);
        return c(n2 - 8, v);
      } else {
        n -= n2;
        if (n < 0) {
          if (offset >= arr.length) throw "End of array";
          accum = (accum << 8) | arr[offset++];
          n += 8;
        }
        v = v * Math.pow(2, n2) + (accum >>> n);
        accum &= (1 << n) - 1;
        return v;
      }
    }
    return c;
  },
  _golombDec: function (arr, P) {
    var logp = Math.round(Math.log(P) * Math.LOG2E);
    var f = this._bitreader(arr);
    var v;
    return function () {
      while (1) {
        v = 0;
        while (f(1)) {
          v += P;
        }
        var tmp = f(logp);
        v += tmp;
        return v;
      }
    };
  },
  query: function (w) {
    var h = this._hash(w) % (this._N * this._P),
      n = 0,
      d,
      f = this._golombDec(this._u8arr, this._P);

    while (1) {
      try {
        d = f();
        n += d;
        if (h === n) {
          return true;
        }
        if (h < n) {
          return false;
        }
      } catch (err) {
        break;
      }
    }
    return false;
  }
};


module.exports = {
  GCSBuilder: GCSBuilder,
  GCSQuery: GCSQuery
};
