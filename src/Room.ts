import {whitelist, ME} from "./config/global";
import {isFriendly} from "./Controller";
import {RoomMemory} from "./declarations";
import * as Config from "./config/global";
import {isEnergyfillable} from "./Structure";

// How damaged something has to be before we'll bother repairing it.
const HITS_CARE_THRESH = 500;

declare global {
    interface Room {
        memory: RoomMemory;

        gc(): void;
        tick(): void;

        spawnCreep(type: string, initialMemory: any): string | undefined;
        maybeSpawnShit(): void;
        getEffectiveLevel(): number;

        getInjuredFriendly(): Creep | undefined;
        getThingsToFill(): Structure[];
        getDamagedStructure(): Structure | undefined;
        getAnEnemy(): Creep | Structure | undefined;
        getEnemies(): Creep[];
        getShittiestWall(): StructureWall | StructureRampart | undefined;

        hasCreep(type: string): boolean;
        hasTower(): boolean;
        getTowers(): Tower[];
        hasFriendlySpawner(): boolean;
        getFriendlySpawner(): Spawn | undefined;
        getIdleSpawner(): Spawn | undefined;
        numSpawners(): number;

        /**
         * Returns true iff this room is owned by me.
         */
        isMine(): boolean;

        /**
         * Returns true if this is a room we are harvesting resources from, but don't actually own.
         */
        isExploited(): boolean;
    }
}



/**
 * The maximum energy storable in a room of each level
 */
const MAX_ENERGY = [
    300,  // 1
    550,  // 2
    800,  // 3
    1300, // 4
    1800, // 5
    2300, // 6
    5600, // 7
    12900 // 8
];


/**
 * Find and return the enemy that should be most urgently murdered, or undefined
 */
Room.prototype.getAnEnemy = function(this: Room): Creep | Structure | undefined {
    // TODO: Ew, unions.
    let candidates = this.find<Creep | OwnedStructure>(FIND_HOSTILE_CREEPS);

    if (candidates.length == 0) {
        candidates = this.find<Creep | OwnedStructure>(FIND_HOSTILE_STRUCTURES).filter(function(s: OwnedStructure) {
            return s.structureType != STRUCTURE_STORAGE && s.structureType != STRUCTURE_CONTAINER && s.structureType != STRUCTURE_RAMPART
        });
    }

    for (let i in candidates) {
        let unit = candidates[i];

        if (unit.hits == 0) {
            continue;
        }

        if (isFriendly(unit)) {
            continue;
        }

        return unit;
    }

    return undefined;
};

/**
 * Return true iff the room's specification defines a creep of type `type`, and at least one of
 * these is currently alive.
 */
Room.prototype.hasCreep = function(this:Room, type: string): boolean {
    if (!this.memory.slots) {
        // Not a programmed room!
        return false;
    }

    if (this.memory.slots[type] != undefined && this.memory.slots[type].length == 0) {
        return false
    }

    return Game.creeps[this.memory.slots[type][0]] != undefined;
};

Room.prototype.getShittiestWall = function(this:Room): StructureWall | StructureRampart | undefined {
    let walls = this.find<StructureWall | StructureRampart>(FIND_STRUCTURES, {
        filter: function (structure: Structure) {
            return (structure.structureType == STRUCTURE_WALL ||
                    structure.structureType == STRUCTURE_RAMPART)
        }
    });

    if (walls.length == 0) {
        return undefined;
    }

    // Find the wall with minimum hitpoints.
    let min = 300000000;
    let minIndex = -1;
    for (let i = 0; i < walls.length; i++) {
        if (walls[i].hits < min) {
            minIndex = i;
            min = walls[i].hits
        }
    }

    return walls[minIndex]
};

Room.prototype.getEnemies = function(this:Room): Creep[] {
    let candidates = this.find<Creep>(FIND_CREEPS);

    let targets:Creep[] = [];
    for (let i in candidates) {
        let enemy = candidates[i];

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
Room.prototype.getInjuredFriendly = function(this:Room) {
    let candidates = this.find<Creep>(FIND_CREEPS);

    for (let i in candidates) {
        let friend = candidates[i];

        if (friend.hits == friend.hitsMax) {
            continue;
        }

        if (!friend.my && friend.owner.username.toLowerCase() == "sheeo") {
            continue;
        }

        return friend;
    }

    return undefined;
};

/**
 * Return an arbitrary, friendly, non-wall structure in need of repair.
 */
Room.prototype.getDamagedStructure = function(this:Room) {
    let structures = this.find<Structure>(FIND_STRUCTURES);

    for (let i in structures) {
        let structure = structures[i];

        // Roads/walls have no ownership, and walls are an infinite black hole of money.
        if (structure.structureType == STRUCTURE_WALL) {
            continue;
        }

        if (structure instanceof OwnedStructure && !structure.my) {
            if (structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER) {
                continue;
            }
        }

        if (structure.structureType == STRUCTURE_RAMPART && structure.hits > 100000) {
            continue;
        }

        // Does the structure need repairing nontrivially?
        if ((structure.hitsMax - structure.hits) >= (structure.structureType == STRUCTURE_ROAD ? HITS_CARE_THRESH * 4 : HITS_CARE_THRESH)) {
            return structure;
        }
    }

    return undefined;
};

Room.prototype.getThingsToFill = function(this:Room): Structure[] {
    return this.find<EnergyFillableStructure>(FIND_MY_STRUCTURES).filter(function (structure:Structure) {
        if (!isEnergyfillable(structure)) {
            return false;
        }

        // Rule out things that don't need filling.
        if (structure.energy == structure.energyCapacity ||
            (structure.structureType == STRUCTURE_TOWER && (structure.energyCapacity - structure.energy) < 400)) {
            return false;
        }

        return true;
    });
};

/**
 * Get a list of towers in this room.
 */
Room.prototype.getTowers = function(this:Room) {
    return this.find<Tower>(FIND_MY_STRUCTURES, {filter: {structureType: STRUCTURE_TOWER}});
};

Room.prototype.hasTower = function(this:Room) {
    return this.getTowers().length > 0;
};

Room.prototype.getFriendlySpawner = function(this:Room) {
    return this.find<Spawn>(FIND_MY_SPAWNS)[0];
};

Room.prototype.getIdleSpawner = function(this:Room) {
    let spawners = this.find<Spawn>(FIND_MY_SPAWNS);
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

    return undefined;
};

Room.prototype.numSpawners = function(this:Room) {
    return this.find<Spawn>(FIND_MY_SPAWNS).length;
};

Room.prototype.hasFriendlySpawner = function(this:Room) {
    return this.find<Spawn>(FIND_MY_SPAWNS).length > 0;
};

Room.prototype.gc = function(this:Room) {
    // Cull dead creeps from role slots.
    for (let role in this.memory.slots) {
        let creepsInRole = this.memory.slots[role];
        for (let slotNum in creepsInRole) {
            let creepName = creepsInRole[slotNum];
            if (!Game.creeps[creepName]) {
                delete creepsInRole[slotNum]
            }
        }
    }

    // Cull dead creeps from renewer slots.
    for (let spawnerName in this.memory.renewers) {
        if (!this.memory.renewers.hasOwnProperty(spawnerName)) {
            continue;
        }

        let renewerName = this.memory.renewers[spawnerName];
        if (!Game.creeps[renewerName]) {
            delete this.memory.renewers[spawnerName];
        }
    }
};

Room.prototype.getEffectiveLevel = function(this:Room) {
    let avail = this.energyCapacityAvailable;
    for (let i = 0; i < MAX_ENERGY.length; i++) {
        if (MAX_ENERGY[i] > avail) {
            return i;
        }
    }

    return 0;
};

Room.prototype.spawnCreep = function (this:Room, type: string, initialMemory: CreepMemory) {
    let spawners = this.find<Spawn>(FIND_MY_SPAWNS);
    for (let i in spawners) {
        let spawner = spawners[i];

        if (spawner.isBusy()) {
            continue;
        }

        let startingMemory = Object.assign({role: type, orders: []}, initialMemory);

        let creepName = spawner.spawnCreep(type, CreepClasses.getBlueprint(type, this.getEffectiveLevel()), startingMemory);

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

    return undefined;
};

/**
 * Spawn any missing units
 */
Room.prototype.maybeSpawnShit = function (this:Room) {
    this.gc();

    let cfg = Config.getRoomConfiguration(this.name);
    let shouldSpawn = cfg.shouldSpawn;
    let wantedCreeps = cfg.creeps;
    let creepPriority = cfg.creepPriority;

    for (let i = 0; i < creepPriority.length; i++) {
        let role = creepPriority[i];
        if (!wantedCreeps.hasOwnProperty(role)) {
            continue;
        }

        if (!this.memory.slots.hasOwnProperty(role)) {
            this.memory.slots[role] = {};
        }

        let roleSlots = this.memory.slots[role];
        let wantedUnits = wantedCreeps[role];
        for (let ind in wantedUnits) {
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
            if (creepName != undefined) {
                console.log("We spawned a new " + role + " creep in slot " + ind);
                roleSlots[ind] = creepName;
            }

            return;
        }
    }
};

Room.prototype.isMine = function(this: Room) {
    return !!this.controller && !!this.controller.owner && this.controller.owner.username == ME
};

Room.prototype.isExploited = function(this: Room) {
    // A room is exploited if it is not owned and any of the following holds:
    // - It is reserved by us.
    // - We are trying to reserve it.
    // - We are trying to mine it.
    if (this.isMine()) {
        return false;
    }

    if (!this.controller) {
        return false;
    }

    if (this.controller.reservation && this.controller.reservation.username == ME) {
        return true;
    }

    // TODO: Determine if we're _trying_ to reserve it?
    return false;
};

Room.prototype.tick = function(this: Room) {
    if (!this.isMine()) {
        return;
    }

    // Spawn things, if necessary.
    if (Game.time % 5 == 0) {
        this.maybeSpawnShit();
    }

    // Make towers do stuff.
    let towers:Tower[] = this.getTowers();

    for (let i in towers) {
        towers[i].tick();
    }
};


