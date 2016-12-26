import {isFull, creepsTargeting} from './logistics';

export function pickDistributionSource(creep, spawn, renew=false) {
    if(creep.memory.target && !renew) {
        return Game.getObjectById(creep.memory.target);
    }
    let targets = spawn.room.find(FIND_STRUCTURES, {
        filter: s => s.structureType == STRUCTURE_CONTAINER
    });
    let [target, max] = [undefined, 1];
    for(let t of targets) {
        if(t.store.energy >= max && t.pos.x != 16 && t.pos.y != 10)
        {
            target = t;
            max = t.store.energy;
        }
    }
    if(!target) target = creep.room.storage;
    creep.memory.target = target.id;
    delete creep.memory._move;
    return target;
}

export function pickClosestDistributionSource(creep: Creep, spawn, renew=false) {
    if(creep.memory.target && !renew) {
        return Game.getObjectById(creep.memory.target);
    }
    let target = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: s => (s.structureType == STRUCTURE_CONTAINER)
        && s.store.energy >= creep.carryCapacity
        && (s.pos.x != 16 && s.pos.y != 10)
    });
    if(!target) target = spawn.room.storage;
    if(!target) return;
    creep.memory.target = target.id;
    delete creep.memory._move;
    return target;
}

function pickDistributionTarget(creep, spawn, renew=false) {
    let target = Game.getObjectById(creep.memory.target);
    if(target && !renew && !isFull(target))
    {
        return target;
    }
    let candidates = spawn.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION
                || structure.structureType == STRUCTURE_SPAWN
                || structure.structureType == STRUCTURE_TOWER) &&
                (structure.energy < structure.energyCapacity);
        }
    });
    candidates.sort((a: Structure, b: Structure) => {
        if(creepsTargeting(a) < creepsTargeting(b)) return 1;
        if(a.structureType == STRUCTURE_TOWER) return -1;
        return creep.pos.getRangeTo(a) < creep.pos.getRangeTo(b) ? 1 : -1
    });
    target = candidates.pop();
    while(creepsTargeting(target, "distributor")>0) {
        target = candidates.pop();
    }
    if(!target) {
        target = spawn.room.storage;
    }
    creep.memory.target = target.id;
    delete creep.memory._move;
    return target;
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
    CARRY, CARRY,
    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
];
export const count = 2;
export const priority = 2;
export const name = "distributor";
export function run(creep, idx, spawn) {
    if(creep.carry.energy == 0 || (!creep.memory.dumping && creep.carry.energy < creep.carryCapacity*0.8)) {
        let target = pickClosestDistributionSource(creep, spawn, true);
        if(!target && creep.carry.energy > 0) {
            creep.memory.dumping = true;
            pickClosestDistributionSource(creep, spawn, true);
        }
        let result = creep.withdraw(target, RESOURCE_ENERGY);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(target);
        }
        else {
            pickDistributionTarget(creep, spawn, true);
        }
    }
    else {
        creep.memory.dumping = true;
        let target = pickDistributionTarget(creep, spawn);

        let transferResult = creep.transfer(target, RESOURCE_ENERGY);
        if(transferResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(target,{reusePath:1});
            return;
        }
        if(creep.carry.energy == 0) {
            creep.memory.dumping = false;
            creep.moveTo(pickClosestDistributionSource(creep, spawn, true));
        }
        else {
            creep.moveTo(pickDistributionTarget(creep, spawn, true));
        }
    }
}
