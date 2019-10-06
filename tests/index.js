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

describe('banks', function() {
	it('builds the correct output with banks', async function() {
		const tic = new TIC80JS({input:'tests/banks', target: 'tic80pro'})
		const output = await tic.build()
		const code = fs.readFileSync('dist/cart.js', 'utf8')
		let tag = `// <PALETTE>`
		console.log(`Checking for ${tag}`)
		assert(code.includes(tag))
		assert(!code.includes(`${tag}>`))
		for(let i=1; i<=7; i++) {
			tag = `// <PALETTE${i}>`
			console.log(`Checking for ${tag}`)
			assert(code.includes(tag))
		}
	});
});