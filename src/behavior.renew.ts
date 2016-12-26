export function getSpawnerEnergy(spawn: Spawn) {
    let count = spawn.energy;
    for(let extension of spawn.room.find<StructureExtension>(FIND_MY_STRUCTURES, {filter: s => s.structureType == STRUCTURE_EXTENSION})) {
        count += extension.energy;
    }
    return count;
}
export function renew(spawn: Spawn, creep: Creep, role) {
    if(creep.memory.role == "reserver"
        || creep.memory.role == "upgrader"
        || creep.memory.role == "forager"
        || !creep.memory.role) {return;}
    if(creep.ticksToLive > 150 && !creep.memory.refilling && !creep.memory.destroy) {
        return creep.memory.refilling = false;
    }
    // We're going to renew / recycle, so clear any foraging/targeting information
    creep.memory.target = undefined;
    if(creep.carry.energy > 0) {
        creep.transfer(spawn, RESOURCE_ENERGY);
    }
    let result;
    if(creep.memory.destroy || (creep.body.length != role.blueprint.length)
        && Game.spawns["Spawn1"].room.storage.store.energy > 50000)
    {
        console.log("Recycling", creep.name);
        let flag = Game.flags[creep.name];
        if(flag) flag.remove();
        result = spawn.recycleCreep(creep);
    }
    else {
        if(creep.ticksToLive < 50 || !creep.room.find(FIND_MY_CREEPS,
                {
                    filter: c => c.ticksToLive < 50
                    && c.name != creep.name
                    && c.memory.role != "upgrader"
                    && c.memory.role != "forager"
                }).length) {
            result = spawn.renewCreep(creep);
        }
        let refillingCount = 0;
        for(let creep in Game.creeps) {
            if(Game.creeps[creep].memory.refilling) refillingCount++;
        }
        if(refillingCount > 1 && creep.ticksToLive > 700) return creep.memory.refilling = false;
    }
    if(result == ERR_NOT_IN_RANGE || result == ERR_BUSY) {
        creep.moveTo(spawn, {
            reusePath: 2
        });
    }
    else if(result == ERR_FULL || creep.ticksToLive > 1400) {
        creep.memory.renewPath = undefined;
        return creep.memory.refilling = false;
    }
    else if(result == ERR_NOT_ENOUGH_ENERGY || getSpawnerEnergy(spawn) == 0) {
        let source = creep.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: (structure) => (structure.structureType == STRUCTURE_CONTAINER)
            || (structure.structureType == STRUCTURE_STORAGE)
            && structure.store.energy >= (creep.carryCapacity - creep.carry.energy)
        });
        if(!source || creep.carryCapacity == 0) {
            creep.memory.action = "Parking";
            creep.moveTo(creep.room.find(FIND_FLAGS, {filter: f=>f.name == "Park"})[0]);
        }
        else if(creep.withdraw(source, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.memory.action = "Moving to source";
            creep.moveTo(source, {reusePath: 0});
        }
    }
    return creep.memory.refilling = true;
}
