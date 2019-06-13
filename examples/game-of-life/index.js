// title:  Game of Life
// author: Rob Loach
// desc:   Game of Life, using ES6 JavaScript https://github.com/robloach/tic80-games
// script: js
// input:  mouse

import GameOfLife from 'game-of-life-logic'

// Variables
let boxSize = 5
const width = 48
const height = 28
let t = 0
const gameOfLife = new GameOfLife(width, height)

// Initialize the grid.
const grid = []
for (let y = 0; y < height; y++) {
  let row = []
  for (let x = 0; x < width; x++) {
    row.push(Math.random() >= 0.5 ? 1 : 0)
  }
  grid.push(row)
}
gameOfLife.copyMatrixAt(0, 0, grid)

// Tick of the game.
export default function TIC() {
  cls(13)

  // Tick the game.
  if (t++ % 10 == 0) {
    gameOfLife.tick()
  }

  // Update input.
  let [mx, my, md] = mouse()
  if (md == 1) {
    let clickX = Math.floor(mx / boxSize)
    let clickY = Math.floor(my / boxSize)
    if (clickX >= 0 && clickX < width && clickY >= 0 && clickY < height) {
      let status = gameOfLife.matrix[clickY][clickX]
      gameOfLife.matrix[clickY][clickX] = status ? 0 : 1
    }
  }

  // Render
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      const color = gameOfLife.matrix[y][x] ? 15 : 0
      rect(x * boxSize, y * boxSize, boxSize, boxSize, color)
    }
  }
}
