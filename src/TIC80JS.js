const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const resolve = require('rollup-plugin-node-resolve')
const builtins = require('rollup-plugin-node-builtins')
const { terser } = require('rollup-plugin-terser')
const extendShallow = require('extend-shallow')
const commentsParser = require('comments-parser')
const { execSync } = require('child_process')
const tempWrite = require('temp-write')

class TIC80JS {
	constructor(input = '.') {
		this.input = input
	}

	constructOptions(options = {}) {
		// Input
		let output = {
			input: '.'
		}
		if (typeof options === 'string' || options instanceof String) {
			output.input = options
		}
		else if (options.input) {
			output.input = options.input
		}

		// Resolve the input location.
		output.input = fs.realpathSync(output.input)

		// Construct the output.
		const defaultOutput = {
			//name: 'tic80',
			file: 'dist/cart.js',
			format: 'cjs',
			strict: false,
			sourcemap: false,
			compact: true,
			esModule: false,
			indent: false
		}
		output.output = extendShallow({}, defaultOutput, options.output || {})
		return output
	}

	metaData(file) {
		let output = {}
		let toGrab = ['title', 'desc', 'author', 'input', 'tags', 'script', 'saveid']
		if (fs.existsSync(file)) {
			let source = fs.readFileSync(file, 'utf-8');
			let comments = []
			try {
				comments = commentsParser(source);
			}
			catch (error) {
				// Nothing
			}
			for (let comment of comments) {
				for (let line of comment.lines) {
					for (let grab of toGrab) {
						if (line.startsWith(grab + ': ')) {
							output[grab] = line.split(': ', 2)[1].trim()
						}
					}
				}
			}
		}

		// Fill in the defaults.
		if (!output.script) {
			output.script = 'js'
		}

		return output
	}

	async build(compress = false) {
		let options = this.constructOptions({
			input: this.input
		})

		let inputTest = require.resolve(options.input)
		let metadata = this.metaData(inputTest)
		let preamble = ''
		for (let metadataKey in metadata) {
			preamble += `// ${metadataKey}: ${metadata[metadataKey]}\n`
		}
		preamble += 'exports=global=module={};'
		options.plugins = [
			builtins(),
			resolve({
				mainFields: ['module', 'main'],
				browser: false
			}),
			commonjs({
				include: 'node_modules/**',
				sourceMap: false
			}),
			babel({
				babelrc: false,
				comments: false,
				sourceMap: false,
				minified: compress,
				compact: compress,
				presets: [
					[
						'@babel/preset-env', {
							modules: false,
							loose: true,
						}
					]
				],
				exclude: 'node_modules/**',
			}),
			terser({
				sourcemap: false,
				output: {
					beautify: !compress,
					preamble: preamble
				},
				compress: compress
			})
		]

		const bundle = await rollup.rollup(options);

		// Build the output options.
		//await bundle.write(options.output)

		// Get the generated code.
		const { output } = await bundle.generate(options.output);

		this.code = ''
		for (const obj of output) {
			if (!obj.isAsset) {
				this.code += obj.code
			}
		}
		return this.code
	}

	async run() {
		let spritepath = ''
		const spritePaths = [
			path.join(this.input, 'sprites.gif'),
			path.join(path.dirname(this.input), 'sprites.gif'),
			'sprites.gif'
		]
		for (const file of spritePaths) {
			if (fs.existsSync(file)) {
				spritepath = file
				break
			}
		}

		// Prepare the cart output.
		if (!fs.existsSync('dist/cart.tic')) {
			fs.writeFileSync('dist/cart.tic', '')
		}

		// Construct the command line arguments.
		//const filePath = tempWrite.sync(this.code)
		const filePath = 'dist/cart.js'
		let command = 'tic80 dist/cart.tic -code ' + filePath
		if (spritepath) {
			command += ' -sprites ' + spritepath
		}

		// Execute TIC-80
		execSync(command)
	}
}

module.exports = TIC80JS
