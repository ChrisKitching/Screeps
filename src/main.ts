PathFinder.use(true);

function gc() {
    // Garbage collect old creep data.
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }
}

export function loop() {
    if (Game.time % 20 == 0) {
        gc();
    }

    for (let roomName in Game.rooms) {
        Game.rooms[roomName].tick();
    }

    // Make creeps do things.
    for(let name in Game.creeps) {
        let creep = Game.creeps[name];

        if (creep.spawning) {
            continue;
        }

        creep.tick();
    }
}
