import {creepsTargeting, getOrCreateFlag} from "./logistics";
import {pickClosestDistributionSource} from './role.distributor';

function getBuildOrRepairTarget(creep: Creep, spawn: Spawn) {
    let target = Game.getObjectById(creep.memory.target);
    if(target) {
        return target;
    }
    let room;
    if(creep.memory.maintainRoom) {
        room = Game.rooms[creep.memory.maintainRoom]
    }
    else {
        room = creep.room;
    }
    let candidates = room.find(FIND_MY_CONSTRUCTION_SITES, {
            filter: (constructionSite) => {
                return constructionSite.progress < constructionSite.progressTotal;
            }
    });
    for(let c of candidates) {
        if(c.structureType == STRUCTURE_EXTENSION || c.structureType == STRUCTURE_CONTAINER || c.structureType == STRUCTURE_TOWER || c.structureType == STRUCTURE_STORAGE) {
            // Always focus the first doable extension/storage
            let flag = getOrCreateFlag(creep);
            flag.setPosition(c.pos);
            creep.memory.target = c.id;
            delete creep.memory._move;
            return c;
        }
    }
    if(candidates.length == 0) {
        for(let i=0; i<Memory.forageSites;i++) {
            let flag = Game.flags["Forage"+i];
            let room = flag.room;
            candidates = room.find(FIND_MY_CONSTRUCTION_SITES);
        }
    }
    candidates.sort((s1, s2) => {
        if(creep.pos.room == s1.room && creep.pos.room == s2.room) {
            return creep.pos.getRangeTo(s1) < creep.pos.getRangeTo(s2) ? -1 : 1
        }
        return s1.pos.y < s2.pos.y ? -1 : 1;
    });
    for(let t of candidates) {
        let count = creepsTargeting(t, "builder");
        if(count > 1) {
            continue;
        }
        let flag = getOrCreateFlag(creep);
        flag.setPosition(t.pos);
        creep.memory.target = t.id;
        delete creep.memory._move;
        return t;
    }
    return undefined;
}

export const blueprint = [
    WORK, WORK,
    WORK, WORK,
    WORK, WORK,
    WORK, WORK,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    CARRY, CARRY,
    MOVE, MOVE, MOVE,
    MOVE, MOVE, MOVE,
    MOVE, MOVE, MOVE,
    MOVE, MOVE, MOVE
];
let distributorRole = require('role.distributor');
export const count = 0;
export const priority = 8;
export const name = "builder";
export function run (creep: Creep, idx: number, spawn: Spawn) {
    if(creep.memory.building && creep.carry.energy != 0) {
        let target = getBuildOrRepairTarget(creep, spawn);
        if(!target) {
            return creep.memory.building = false;
        }

        let result;
        if(target.hits < target.hitsMax) {
            result = creep.repair(target);
        }
        else {
            result = creep.build(target);
        }
        creep.moveTo(target);
        if(result == ERR_NOT_IN_RANGE) {
            creep.memory.action = "Moving to build/repair target at " + target.room + " - " + target.pos.x + "," + target.pos.y;
            creep.moveTo(target);
        }
        else if(result < 0) {
            creep.memory.target = undefined;
            let target = getBuildOrRepairTarget(creep, spawn);
            creep.moveTo(target);
        }
    }
    else {
        creep.memory.building = false;
        if(creep.carry.energy == creep.carryCapacity) {
            creep.memory.building = true;
            return;
        }
        let source = creep.pos.findClosestByPath(FIND_DROPPED_ENERGY);
        if(!source) {
            source = pickClosestDistributionSource(creep, spawn, true);
        }
        if(!source) {
            return distributorRole.run(creep, idx, spawn);
        }
        getOrCreateFlag(creep).setPosition(source.pos);
        let result;
        if(source.resourceType) {
            result = creep.pickup(source);
        }
        else {
            result = creep.withdraw(source, RESOURCE_ENERGY);
        }
        if(result == ERR_NOT_IN_RANGE) {
            creep.memory.action = "Moving to energy source";
            creep.moveTo(source);
        }
    }
    return;
}
