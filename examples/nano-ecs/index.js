// title:  ECS Test
// author: Rob Loach
// desc:   Testing out an ECS in JavaScript.
// script: js

import ecs from 'nano-ecs'

// Create the world.
const world = ecs()
let t = 0

// Position Component.
function Position() {
    this.x = 96
    this.y = 24
}

// Hello World
const helloWorld = world.createEntity()
    .addComponent(Position)
    .on('init', function() {
        this.position.x = this.position.y = 84
    })
    .on('draw', function() {
        print('HELLO WORLD!', this.position.x, this.position.y)
    })

// Player
const player = world.createEntity()
    .addComponent(Position)
    .on('draw', function () {
        spr(1 + ( (t % 60) / 30 | 0) * 2, this.position.x, this.position.y, 14, 3, 0, 0, 2, 2)
    })
    .on('update', function () {
        if (btn(0)) this.position.y -= 1
        if (btn(1)) this.position.y += 1
        if (btn(2)) this.position.x -= 1
        if (btn(3)) this.position.x += 1
    })

// Initialize all entities.
for (let entity of world.queryComponents([])) {
    entity.emit('init')
}

export function TIC() {
    cls(13)
    t++

    // Update the position of all entities.
    for (let entity of world.queryComponents([Position])) {
        entity.emit('update')
    }

    // Draw all entities.
    for (let entity of world.queryComponents([])) {
        entity.emit('draw')
    }
}
