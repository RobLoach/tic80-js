const assert = require('assert');
const TIC80JS = require('..')

describe('simple', function() {
	it('builds the correct output', async function() {
		const tic = new TIC80JS('tests/simple')
		const output = await tic.build()
		assert(output.includes('function TIC(){btn(0)'))
	});
});
