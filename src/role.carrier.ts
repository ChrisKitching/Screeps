import {isFull, isEmpty, creepsTargeting} from './logistics';

export function pickCarrierSource(creep, spawn, otherRooms=true, role: string | false=false) {
    let target = Game.getObjectById(creep.memory.target);
    if(target && !isEmpty(target)) {
        return target;
    }
    let candidates = creep.room.find(FIND_DROPPED_ENERGY, {
        filter: (t) => creepsTargeting(t, role) < 2
    });
    if(candidates.length == 0 && otherRooms) {
        for(let roomName in Game.rooms) {
            let room = Game.rooms[roomName];
            if(!room || room.name == creep.room.name
                || room.name == "W73N57" || room.name == "W72N57" || room.name == "W75N58" || room.name == "W71N56") {
                continue;
            }
            candidates = candidates.concat(room.find(FIND_DROPPED_ENERGY));
        }
        if(candidates.length == 0) {
            creep.memory.target = undefined;
            delete creep.memory._move;
            return;
        }
    }
    candidates.filter((c) => c.resourceType == RESOURCE_ENERGY);
    candidates.sort((a, b) => {
        return a.energy < b.energy ? -1:1;
    });
    candidates.sort((a, b) => {
        let [ctA, ctB] = [creepsTargeting(a), creepsTargeting(b)];
        if(ctA == ctB) return 0;
        return ctA < ctB ? 1:-1;
    });
    let cString = "";
    for(let c of candidates) {
        cString += `${creepsTargeting(c)}:${c.energy} - `
    }
    target = candidates.pop();
    if(!target) return;
    creep.memory.target = target.id;
    delete creep.memory._move;
    let path = PathFinder.search(creep.pos, target.pos);
    if(path.cost*2 > creep.ticksToLive-150) {
        console.log(`Renewing ${creep.name} prior to new job:`, creep.ticksToLive, path.cost*2);
        creep.memory.refilling = true;
        return;
    }
    return target;
}

export function hasTower(room: Room) {
    return room.find(FIND_STRUCTURES, {filter: s => s.structureType == STRUCTURE_TOWER}).length
}

export const blueprint = [
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    WORK,
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
];
export const count = 8;
export const priority = 3;
export const name = "carrier";
export function run(creep: Creep, idx, spawn) {
    if (creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0 && !hasTower(creep.room)) {
        let stuff = creep.pos.findClosestByRange<StructureRoad>(FIND_STRUCTURES, {
            filter: s => s.structureType == STRUCTURE_ROAD && (s.hitsMax - s.hits) >= 100
        });
        if(stuff) creep.repair(stuff);
        let csite = creep.pos.findClosestByRange<ConstructionSite>(FIND_MY_CONSTRUCTION_SITES, {filter: s => s.structureType == STRUCTURE_ROAD});
        if(csite) creep.build(csite);
    }
    if(!creep.memory.dumping && _.sum(creep.carry) < creep.carryCapacity) {
        let target = pickCarrierSource(creep, spawn, creep.carry.energy < creep.carryCapacity*.5, "carrier");
        if(!target) {
            if(creep.room.name == spawn.room.name) {
                creep.memory.dumping = true;
                return;
            }
            else {
                target = pickCarrierSource(creep, spawn, true, "carrier");
            }
            if(!target) {
                return;
            }
        }
        let result = creep.pickup(target);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
    }
    else {
        creep.memory.dumping = true;
        let target = Game.getObjectById(creep.memory.target);
        if(!target || isFull(target) || Game.time % 10 == 0)
        {
            let targets = spawn.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_CONTAINER || structure.structureType == STRUCTURE_STORAGE) &&
                        (structure.pos.x != 16 && structure.pos.y != 10)
                        && (structure.store.energy < structure.storeCapacity);
                }
            });
            targets.sort((a, b) => {
                return a.pos.y < b.pos.y;
            });
            if(targets.length == 0) {
                creep.memory.action = "Parking";
                creep.moveTo(spawn.room.find(FIND_FLAGS, {filter: f=>f.name == "Park"})[0]);
                return;
            }
            target = targets[0];
            creep.memory.target = target.id;
        }
        if(_.sum(creep.carry)-creep.carry.energy > 0) {
            target = spawn.room.storage;
        }
        let transferResult;
        for(let resource in creep.carry) {
            transferResult = creep.transfer(target, resource);
        }
        if(transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        else if(transferResult == ERR_NOT_ENOUGH_RESOURCES) {
            creep.memory.dumping = false;
            creep.memory.target = undefined;
            delete creep.memory._move;
        }
        else if (transferResult == ERR_FULL) {
            creep.memory.target = undefined;
            delete creep.memory._move;
        }
        else if(transferResult == ERR_INVALID_TARGET) {
            creep.memory.target = undefined;
            delete creep.memory._move;
        }
    }
}
