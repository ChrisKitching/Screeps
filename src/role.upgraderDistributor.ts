function isFull(target) {
    if(target.energy && target.energyCapacity && target.energy == target.energyCapacity) {
        return true;
    }
    if(target.store && target.store.energy && target.storeCapacity && target.store.energy == target.storeCapacity) {
        return true;
    }
    return false;
}

module.exports = {
    blueprint: [
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
    ],
    count: 1,
    priority: 8,
    name: "upgraderDistributor",
    run: function(creep, idx, spawn) {
        if(!creep.memory.dumping && creep.carry.energy < creep.carryCapacity*.8) {
            if(!creep.memory.target) {
                let targets = spawn.room.find(FIND_STRUCTURES, {
                    filter: s => s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE
                });
                let [target, max] = [undefined, 0];
                for(let t of targets) {
                    if(t.pos.x == 16 && t.pos.y == 10) continue;
                    if(t.store.energy >= max) {
                        target = t;
                        max = t.store.energy;
                    }
                }
                if(!target) return;
                creep.memory.target = target.id;
            }
            let target = Game.getObjectById(creep.memory.target);
            let result = creep.withdraw(target, RESOURCE_ENERGY);
            if(result == ERR_NOT_IN_RANGE) {
                creep.moveTo(target);
            }
            else {
                creep.memory.target = undefined;
                delete creep.memory._move;
            }
        }
        else {
            creep.memory.dumping = true;
            let target = Game.getObjectById(creep.memory.target);
            if(!target)// || isFull(target))
            {
                targets = [spawn.room.lookForAt(LOOK_STRUCTURES, 16, 10)[1]];
                target = targets[0];
                creep.memory.target = target.id;
            }

            let transferResult = creep.transfer(target, RESOURCE_ENERGY);
            if(transferResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(target,{reusePath:0});
                return;
            }
            else if(transferResult != ERR_FULL) {
                creep.memory.dumping = false;
            }
            creep.memory.target = undefined;
            delete creep.memory._move;
        }
	}
};
