const fs = require('fs')
const path = require('path')
const rollup = require('rollup')
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const json = require('rollup-plugin-json')
const resolve = require('rollup-plugin-node-resolve')
const builtins = require('rollup-plugin-node-builtins')
const { terser } = require('rollup-plugin-terser')
const extendShallow = require('extend-shallow')
const commentsParser = require('comments-parser')
const { execSync } = require('child_process')
const tempWrite = require('temp-write')

class TIC80JS {
	constructor(conf) {
		console.log('Requested TIC80JS using:',conf);
		const defaults = {
			input: '.',
			target: 'tic80',
			compact: true
		}
		this.conf = Object.assign({}, defaults, conf);
		console.log('Created TIC80JS using:',this.conf);
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

	cartData(file) {
		let output = {}
		let toGrab = ['TILES', 'PALETTE']
		if (fs.existsSync(file)) {
			let source = fs.readFileSync(file, 'utf-8');
			let comments = []
			try {
				comments = commentsParser(source);
			}
			catch (error) {
				// Nothing
			}
			const states = { OUTSIDE: 1, FIRSTLINE: 2, INBLOCK: 3};
			let blockType = '', state = states.OUTSIDE;
			for (let comment of comments) {
				// TIC-80 PRO Data comments are all single-line comments
				let line = comment.lines[0];
				// Look for state changes as we scan through the lines
				switch (state) {
					case states.OUTSIDE:
						// Look for the start of a block
						for (let grab of toGrab) {
							if (line.startsWith("<" + grab)) {
								// We found one - init working variables
								blockType = grab;
								output[blockType] = [];
								// This is the first line - we don't want to process it
								state = states.FIRSTLINE;
							}
						}
						break;

					case states.FIRSTLINE:
						// We only have one first line - we are now in the block
						state = states.INBLOCK;
						break;

					case states.INBLOCK:
						// Look for the last line of the block
						for (let grab of toGrab) {
							if (line.startsWith("</" + grab)) {
								// We are on the last line of a block - reset working variables
								blockType = '';
								// The next line will be outside this block - we want to start looking for the begining of the next block
								state = states.OUTSIDE;
							}
						}
						break;

				}
				// Now act on the current state
				if(state == states.INBLOCK) {
					output[blockType].push(line);
				}
			}
		}
		
		return output
	}

	async build() {
		let options = this.constructOptions({
			input: this.conf.input,
			target: this.conf.target,
			output: {compact: this.conf.compact}
		})
		console.log('Using options:',options);
		let compress = options.output.compact

		let inputTest = require.resolve(options.input)
		let metadata = this.metaData(inputTest)
		let preamble = ''
		for (let metadataKey in metadata) {
			preamble += `// ${metadataKey}: ${metadata[metadataKey]}\n`
		}
		preamble += 'exports=global=module={};'

		// The tic80pro reads most non-js assets from specially formatted comments
		// If we are building for the tic80pro, make sure we read those and prepare
		// them to be added to the end of the tic.js file later
		let assetComments = '\n'
		if (options.target == 'tic80pro') {
			let cartData = this.cartData(inputTest)
			for (let assetBlockKey in cartData) {
				assetComments += `// <${assetBlockKey}>\n`
				assetComments += cartData[assetBlockKey].reduce((o,v)=>{return o+=`// ${v}\n`},'');
				assetComments += `// </${assetBlockKey}>\n\n`
			}
		}

		// Configure the plugins that will transpile (and optionally compress) our cart.js
		options.plugins = [
			json({
				compact: compress,
				indent: compress ? '' : '  '
			}),
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
				compress: compress ? {
				} : false,
				mangle: compress ? {
					reserved: [
						'TIC'
					],
					toplevel: false
				} : false
			})
		]
		if (options.target == 'tic80pro') {
			options.plugins[options.plugins.length] = 
				{
					name: 'wrap-up', // this name will show up in warnings and errors
					load ( id ) {
						// just report what files we load
						console.log("Loaded:",id);
						return null; // we aren't actually making any changes
					},
					writeBundle ( config ) {
						let fileName = options.output.file;
						console.log("Appending tic-80 pro assets to:", fileName);
						fs.writeFileSync(fileName,assetComments,{flag:'a'});
					}
				}
			
		}

		const bundle = await rollup.rollup(options);

		// Build the output options.
		await bundle.write(options.output)

		// Get the generated code.
		/*
		const { output } = await bundle.generate(options.output);

		this.code = ''
		for (const obj of output) {
			if (!obj.isAsset) {
				this.code += obj.code
			}
		}
		return this.code
		*/
	}

	async run() {
		let spritepath = ''
		const spritePaths = [
			path.join(this.conf.input, 'sprites.gif'),
			path.join(path.dirname(this.conf.input), 'sprites.gif'),
			'sprites.gif'
		]
		for (const file of spritePaths) {
			if (fs.existsSync(file)) {
				spritepath = file
				break
			}
		}

		let command = ''
		if (this.conf.target=='tic80pro') {
			// For Pro, only load the .js file
			console.log('Launching cart.js directly in tic80pro')
			command = 'tic80 dist/cart.js'
		} else {
			console.log('Launching cart.tic, cart.js, and sprites.gif')

			// Prepare the cart output.
			if (!fs.existsSync('dist/cart.tic')) {
				fs.writeFileSync('dist/cart.tic', '')
			}

			// Construct the command line arguments.
			//const filePath = tempWrite.sync(this.code)
			const filePath = 'dist/cart.js'
			command = 'tic80 dist/cart.tic -code ' + filePath
			if (spritepath) {
				command += ' -sprites ' + spritepath
			}
		}

		if (this.conf.target != 'tic80uwp') {
			// Execute TIC-80
			console.log(command);
			execSync(command)
		} else {
			// Execute TIC-80 UWP
			// Note: currently this is useless as even once you find the path below the uwp app does not accept any command line arguments
			command = 'explorer.exe shell:appsfolder\\50446Nesbox.TICcomputer_8y3dwps6jawp4!App'
			execSync(command)
		}
	}
}

module.exports = TIC80JS
