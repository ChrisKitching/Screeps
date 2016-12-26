export const blueprint = [
    WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, // 1300
    WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,             // 2300
    CARRY, CARRY, CARRY, CARRY,                                                   // 2600
    MOVE, MOVE, MOVE, MOVE                                                        // 2800
];
export const count = 2;
export const countFn = () => {
    if(Math.floor(Game.spawns['Spawn1'].room.storage.store.energy / 20000) > 4) {
        return 4;
    }
    return Math.floor(Game.spawns['Spawn1'].room.storage.store.energy / 20000);
};
export const priority = 9;
export const name = "upgrader";
export function run (creep, idx) {
    let source;
    let nearbyDropped = creep.pos.findInRange(FIND_DROPPED_ENERGY, 3);
    if(nearbyDropped.length > 0) {
        source = nearbyDropped[0];
    }
    else {
        source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType == STRUCTURE_CONTAINER
            && structure.pos.x == 16
        });
    }

    let withdrawResult;
    if(source.resourceType == RESOURCE_ENERGY) {
        withdrawResult = creep.pickup(source);
    }
    else {
        withdrawResult = creep.withdraw(source, RESOURCE_ENERGY);
    }

    if(creep.memory.upgrading && creep.carry.energy == 0) {
        creep.memory.upgrading = false;
    }
    if(!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
        creep.memory.upgrading = true;
    }

    if(creep.memory.upgrading) {
        let result = creep.upgradeController(creep.room.controller);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, {reusePath: 0});
        }
    }
    else {
        if(withdrawResult == ERR_NOT_IN_RANGE) {
            creep.moveTo(source, {reusePath: 0});
        }
    }
}
