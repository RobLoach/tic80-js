#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const TIC80JS = require('..')
const configFile = path.resolve('tic80jsconf.js'); 
let config = {};
if(fs.existsSync(configFile)) {
	config = require(configFile);
}

console.log('Using defaults from tic80jsconf.js:', config);

require('yargs')
	.scriptName('tic80-js')
	.command(['run [input]', '$0 [input]'], 'Build and run the TIC-80 .js game',
		(yargs) => {
			yargs.positional('input', {
				describe: 'The input file to build',
				type: 'string',
				default: config.input || '.'
			})
		},
		async (argv) => {
			config.input = argv.input
			config.target = argv.target
			config.compact = argv.compress
			const tic = new TIC80JS(config)
			await tic.build()
			await tic.run()
		}
	)
	.option('compress', {
		describe: 'Whether or not to compress the output file.',
		type: 'boolean',
		alias: 'c',
		default: (typeof config.compact !== 'undefined')?config.compact:true
	})
	.option('target', {
		describe: 'Target platform for the output file.',
		choices: ['tic80', 'tic80pro', 'tic80uwp'],
		alias: 't',
		default: config.target || 'tic80'
	})
	.argv
