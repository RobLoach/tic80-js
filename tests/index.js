const assert = require('assert');
const TIC80JS = require('..')
const fs = require('fs')

describe('simple', function() {
	it('builds the correct output', async function() {
		const tic = new TIC80JS({input:'tests/simple'})
		const output = await tic.build()
		const code = fs.readFileSync('dist/cart.js', 'utf8')
		assert(code.includes('function TIC(){'))
	});
});
