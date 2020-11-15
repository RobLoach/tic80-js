# TIC-80 JS

Bundle and run your [TIC-80](https://tic.computer) ES6 JavaScript carts.

## Installation

``` sh
npm i tic80-js --save-dev
```

## Usage

1. Create a JavaScript TIC-80 *index.js* with ES6:
	``` js
	// title:  TIC-80 JS Simple Test
	// author: Rob Loach
	// desc:   Small example of using tic80-js
	// script: js
	let t = 0
	let x = 96
	let y = 24
	let world = 'WORLD!'
	export function TIC() {
		if (btn(0)) y--
		if (btn(1)) y++
		if (btn(2)) x--
		if (btn(3)) x++
		cls(13)
		spr(1 + ( (t % 60) / 30 | 0) * 2, x, y, 14, 3, 0, 0, 2, 2)
		print(`HELLO ${world}`, 84, 84)
		t++
	}
	```

2. Create a [*sprites.gif*](tests/simple/sprites.gif) in the same directory that would be used for the game.

3. Build and run the game through TIC-80 JS:
    ```
    npx tic80-js index.js
    ```

4. To export the *cart.tic*, press escape to load the console, and use `save`.

## Examples

There are some [examples](examples) that are available that give some sense of how TIC-80 JS could be used.

## Other Solutions

There are a few alternatives to tic80-js:

- [tic-bundle](https://github.com/chronoDave/tic-bundle)
- [scriptpacker](https://github.com/robloach/scriptpacker)
