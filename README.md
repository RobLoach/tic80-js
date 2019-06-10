# TIC-80 JS

Bundle and run your [TIC-80](https://tic.computer) ES6 JavaScript carts.

## Installation

``` sh
npm i tic80-js --global
```

## Usage

1. Create a JavaScript TIC-80 *cart.js* with ES6:
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

2. Create a [*sprites.gif*](tests/simple/sprites.gif) that would be used for the game.

3. Build and run the game through TIC-80 JS:
    ```
    tic80-js cart.js
    ```

4. To export the *cart.tic*, press escape to load the console, and use `save`.