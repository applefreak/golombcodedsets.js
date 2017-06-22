# golombcodedsets.js

This is an NPM package with a refactored version of https://github.com/rasky/gcs

```javascript
const gcs = require('golombcodedsets');

const builder = new gcs.GCSBuilder(20, 10);

console.log('Adding "item1" & "item2"')
builder.add('item1')
builder.add('item2')

const hash = builder.toBase64()

console.log('base64 representation of the set:', hash)

var query = new gcs.GCSQuery(hash)

console.log('Checking "item2":', query.query('item2'))
console.log('Checking "item3":', query.query('item3'))
```

# Custom hash functions

The default are the 32 least significant bits of a md5 hash;
Using murmurhash (faster) instead:

	var murmurhash = require('murmurhash');

	var builder = new gcs.GCSBuilder(numberOfItems, error_probability, murmurhash.v3);
	var query = new gcs.GCSQuery(arrayBuffer, murmurhash.v3);

Parameter of the hash function should be a string, while the output is an integer. 
	
