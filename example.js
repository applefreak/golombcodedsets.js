const gcs = require('golombcodedsets');

const builder = new gcs.GCSBuilder(20, 10);

console.log('Adding "item1" & "item2"')
builder.add('item1');
builder.add('item2');

const hash = builder.toBase64()

console.log('base64 representation of the set:', hash)

var query = new gcs.GCSQuery(hash)

console.log('Checking "item2":', query.query('item2'))
console.log('Checking "item3":', query.query('item3'))
