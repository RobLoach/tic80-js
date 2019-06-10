// title:  tic-80-js-simple
// author: Rob Loach
// desc:   Small example of using tic80-js
// script: js

import {hello} from './helloworld'

let t = 0
let x = 96
let y = 24

export function TIC() {
	if (btn(0)) {
		y--
	}
	if (btn(1)) {
		y++
	}
	if (btn(2)) {
		x--
	}
	if (btn(3)) {
		x++
	}

	cls(13)
	spr(1 + ( (t % 60) / 30 | 0) * 2, x, y, 14, 3, 0, 0, 2, 2)
	print(hello(), 84, 84)
	t++
}
