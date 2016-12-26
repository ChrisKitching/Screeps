let Orders = require('orders');
let util = require('util');
let CreepClasses = require('CreepClasses');

// How damaged something has to be before we'll bother repairing it.
const HITS_CARE_THRESH = 500;
const WALL_DONE_THRESH = 10000000;

let SHOULD_NOT = -4;
let FAILED = -3;


/**
 * Find and return the enemy that should be most urgently murdered, or undefined
 */
Room.prototype.getAnEnemy = function () {
    var candidates = this.find(FIND_CREEPS);

    if (candidates.length == 0) {
        candidates = this.find(FIND_HOSTILE_STRUCTURES);
    }

    for (i in candidates) {
        var enemy = candidates[i];

        if (enemy.hits == 0) {
            continue;
        }

        if (enemy.my) {
            continue;
        }

        if (enemy.owner.username.toLowerCase() == "sheeo") {
            continue;
        }

        return enemy;
    }
};

/**
 * Return true iff the room's specification defines a creep of type `type`, and at least one of
 * these is currently alive.
 */
Room.prototype.hasCreep = function (type) {
    if (!this.memory.slots) {
        // Not a programmed room!
        return false;
    }

    if (this.memory.slots[type] != undefined && this.memory.slots[type].length == 0) {
        return false
    }

    return Game.creeps[this.memory.slots[type][0]] != undefined;
};

Room.prototype.getShittiestWall = function () {
    var walls = this.find(FIND_STRUCTURES, {
        filter: function (structure) {
            return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART)
        }
    });
    if (walls.length == 0) {
        return;
    }

    // Find the wall with minimum hitpoints.
    let min = 300000000;
    let minIndex = -1;
    for (let i in walls) {
        if (walls[i].hits < min) {
            minIndex = i;
            min = walls[i].hits
        }
    }

    if (min >= WALL_DONE_THRESH) {
        return;
    }

    return walls[minIndex]
};

Room.prototype.getEnemies = function () {
    var candidates = this.find(FIND_CREEPS);

    var targets = [];
    for (i in candidates) {
        var enemy = candidates[i];

        if (enemy.hits == 0) {
            continue;
        }

        if (enemy.my) {
            continue;
        }

        if (enemy.owner.username.toLowerCase() == "sheeo") {
            continue;
        }

        targets.push(enemy);
    }

    return targets;
};

/**
 * Return an arbitrary injured friendly unit.
 */
Room.prototype.getInjuredFriendly = function () {
    var candidates = this.find(FIND_CREEPS);

    var target = undefined;
    for (i in candidates) {
        var friend = candidates[i];

        if (friend.hits == friend.hitsMax) {
            continue;
        }

        if (!friend.my && friend.owner.username.toLowerCase() == "sheeo") {
            continue;
        }

        return friend;
    }
};

/**
 * Return an arbitrary, friendly, non-wall structure in need of repair.
 */
Room.prototype.getDamagedStructure = function () {
    var structures = this.find(FIND_STRUCTURES);

    for (i in structures) {
        let structure = structures[i];

        // Roads/walls have no ownership, and walls are an infinite black hole of money.
        if (structure.structureType == STRUCTURE_WALL ||
            (!structure.my && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER)) {
            continue;
        }

        if (structure.structureType == STRUCTURE_RAMPART && structure.hits > 100000) {
            continue;
        }

        // Does the structure need repairing nontrivially?
        if ((structure.hitsMax - structure.hits) >= (structure.structureType == STRUCTURE_ROAD ? HITS_CARE_THRESH * 4 : HITS_CARE_THRESH)) {
            return structure;
        }
    }
};

Room.prototype.getThingsToFill = function () {
    let structures = this.find(FIND_MY_STRUCTURES).filter(function (structure) {
        // Rule out things that simply can't be filled.
        if (!util.structureIsFillable(structure)) {
            return false;
        }

        // Rule out things that don't need filling.
        if (structure.energy == structure.energyCapacity ||
            (structure.structureType == STRUCTURE_TOWER && (structure.energyCapacity - structure.energy) < 400)) {
            return false;
        }

        return true;
    });

    return structures;
};

/**
 * Get a list of towers in this room.
 */
Room.prototype.getTowers = function () {
    return this.find(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
};

Room.prototype.hasTower = function () {
    return this.getTowers().length > 0;
};

Room.prototype.getFriendlySpawner = function () {
    return this.find(FIND_MY_SPAWNS)[0];
};

Room.prototype.getIdleSpawner = function () {
    let spawners = this.find(FIND_MY_SPAWNS);
    for (let i in spawners) {
        let spawner = spawners[i];
        if (spawner.spawning) {
            continue;
        }

        if (this.memory.renewers[spawner.name]) {
            continue;
        }

        return spawner;
    }
};

Room.prototype.numSpawners = function () {
    return this.find(FIND_MY_SPAWNS).length;
};

Room.prototype.hasFriendlySpawner = function () {
    return this.find(FIND_MY_SPAWNS).length > 0;
};

Room.prototype.gc = function () {
    if (!this.memory.slots) {
        this.memory.slots = {};
    }

    // Garbage collect old creep data.
    for (let name in Memory.creeps) {
        if (!Game.creeps[name]) {
            delete Memory.creeps[name];
        }
    }

    // Cull dead creeps from role slots.
    for (role in this.memory.slots) {
        let creepsInRole = this.memory.slots[role];
        for (slotNum in creepsInRole) {
            let creepName = creepsInRole[slotNum];
            if (!Game.creeps[creepName]) {
                delete creepsInRole[slotNum]
            }
        }
    }

    // Cull dead creeps from renewer slots.
    let renewer = this.memory.renewers;
    for (let spawnerName in this.memory.renewers) {
        let renewerName = this.memory.renewers[spawnerName];
        if (!Game.creeps[renewerName]) {
            delete this.memory.renewers[spawnerName];
        }
    }
};

Room.prototype.spawnCreep = function (type, initialMemory) {
    let spawners = this.find(FIND_MY_SPAWNS);
    for (let i in spawners) {
        let spawner = spawners[i];

        // Spawner is busy renewing a creep.
        if (this.memory.renewers[spawner.name]) {
            continue;
        }

        let startingMemory = Object.assign({role: type, orders: []}, initialMemory);

        let creepName = spawner.createCreep(CreepClasses.getBlueprint(type, this.controller.level), type + (Memory.creepNum++), startingMemory);
        // Check for all error codes, exhaustively.

        switch (creepName) {
            case ERR_NOT_OWNER:
            case ERR_BUSY:
            case ERR_NOT_ENOUGH_ENERGY:
                continue;
            case ERR_INVALID_ARGS:
                console.log(this.name + ": Blueprint for " + type + " may be invalid!");
                return false;

            case ERR_NAME_EXISTS:
                console.log(this.name + ": Creep name collision of type " + type);
                return false;
            case ERR_RCL_NOT_ENOUGH:
                return false;
        }

        return creepName;
    }

    return false;
};

/**
 * Spawn any missing units
 */
Room.prototype.maybeSpawnShit = function () {
    this.gc();

    let cfg = require(this.name);
    let shouldSpawn = cfg.shouldSpawn;
    let initialState = cfg.initialState;
    let creepPriority = cfg.creepPriority;

    for (let i = 0; i < creepPriority.length; i++) {
        let role = creepPriority[i];
        if (!initialState.hasOwnProperty(role)) {
            continue;
        }

        if (!this.memory.slots.hasOwnProperty(role)) {
            this.memory.slots[role] = {};
        }

        let roleSlots = this.memory.slots[role];
        let wantedUnits = initialState[role];
        for (ind in wantedUnits) {
            // This unit already exists.
            if (roleSlots.hasOwnProperty(ind.toString())) {
                continue;
            }

            // Is this a unit we actually want?
            if (shouldSpawn[role] && !shouldSpawn[role](wantedUnits[ind])) {
                continue;
            }

            let creepName = this.spawnCreep(role, wantedUnits[ind]);
            // If a creep was actually created, record it.
            if (creepName != false) {
                console.log("We spawned a new " + role + " creep in slot " + ind);
                roleSlots[ind] = creepName;
            }

            return;
        }
    }
};


declare global {
    interface Room {
        hasFriendlySpawner(): boolean;
        gc(): void;
        spawnCreep(type: string, initialMemory: any): void;
        maybeSpawnShit(): void;
    }
}
