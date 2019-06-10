#!/usr/bin/env node

const TIC80JS = require('..')

require('yargs')
	.scriptName('tic80-js')
	.command(['run [input]', '$0 [input]'], 'Build and run the TIC-80 .js game',
		(yargs) => {
			yargs.positional('input', {
				describe: 'The input file to build',
				type: 'string',
				default: '.'
			})
		},
		async (argv) => {
			const tic = new TIC80JS(argv.input)
			await tic.build()
			await tic.run()
		}
	)
	.argv