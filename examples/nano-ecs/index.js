// title:  ECS Test
// author: Rob Loach
// desc:   Testing out an ECS in JavaScript.
// script: js

import ecs from 'nano-ecs'

// Create the world.
const world = ecs()
let t = 0

// Hello World
const helloWorld = world.createEntity()
    .on('init', function() {
        this.x = this.y = 84
    })
    .on('draw', function() {
        print('HELLO WORLD!', this.x, this.y)
    })

// Player
const player = world.createEntity()
    .on('init', function() {
        this.x = 96
        this.y = 24
    })
    .on('draw', function () {
        spr(1 + ( (t % 60) / 30 | 0) * 2, this.x, this.y, 14, 3, 0, 0, 2, 2)
    })
    .on('update', function () {
        if (btn(0)) this.y -= 1
        if (btn(1)) this.y += 1
        if (btn(2)) this.x -= 1
        if (btn(3)) this.x += 1
    })

// Initialize all entities.
for (let entity of world.queryComponents([])) {
    entity.emit('init')
}

export function TIC() {
    cls(13)
    t++

    // Update the position of all entities.
    for (let entity of world.queryComponents([])) {
        entity.emit('update')
    }

    // Draw all entities.
    for (let entity of world.queryComponents([])) {
        entity.emit('draw')
    }
}
