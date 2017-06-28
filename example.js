const gcs = require('./golombcodedsets');

const builder = new gcs.GCSBuilder(50, 1000);

console.log('Adding "item1" & "item2"')
builder.add('item1');
builder.add('item2');

const hash = builder.toBase64()

console.log('base64 representation of the 1st set:', hash)

var query = new gcs.GCSQuery(hash)

console.log('Checking "item2" (Should be true): ', query.query('item2'))
console.log('Checking "item3" (Should be false):', query.query('item3'))

console.log('Transform query to builder...')
let builder2 = query.toBuilder()
console.log('Adding "item6"')
builder2.add('item6')
let hash2 = builder2.toBase64()

console.log('base64 representation of the 2nd set:', hash2)

var query2 = new gcs.GCSQuery(hash2)
console.log('Checking "item2" (Should be true): ', query.query('item2'))
console.log('Checking "item3" (Should be false):', query.query('item3'))
console.log('Checking "item6" (Should be true): ', query2.query('item6'))

