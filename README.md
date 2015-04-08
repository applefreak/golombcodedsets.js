# golombcodedsets.js

This is an NPM package with a refactored version of https://github.com/rasky/gcs

	var gcs = require('golombcodedsets');
	
	var builder = new gcs.GCSBuilder(numberOfItems, error_probability);

	builder.add('item1');
	builder.add('item2');
	
	var arrayBuffer = builder.finalize();

	var query = new gcs.GCSQuery(arrayBuffer);
	builder.query('item1'); // true
	builder.query('item3'); // false

# Custom hash functions

The default are the 32 least significant bits of a md5 hash;
Using murmurhash (faster) instead:

	var murmurhash = require('murmurhash');

	var builder = new gcs.GCSBuilder(numberOfItems, error_probability, murmurhash.v3);
	var query = new gcs.GCSQuery(arrayBuffer, murmurhash.v3);

Parameter of the hash function should be a string, while the output is an integer. 
	
