var roleBase = require('role.base');
var Orders = require('orders');

/**
 * Mines shit and drops it on the floor.
 */
module.exports = {
    run: function(creep) {
        // Require that Memory.toMine be set...
        if (!creep.memory.toMine) {
            console.log(creep.name + " awaiting instructions");
            return;
        }

        // If we have storage capacity, dump resources into the container we're
        // standing on, or maybe repair it.
        if (creep.carry.energy > 10) {
            // If you're sitting on a construction site, construct it!
            let constructions = creep.room.lookForAt(LOOK_CONSTRUCTION_SITES, creep.pos);
            if (constructions.length > 0) {
                let construction = constructions[0];
                creep.build(construction);
                return;
            }

            let containers = creep.room.lookForAt(LOOK_STRUCTURES, creep.pos).filter(function(c) { return c.structureType == STRUCTURE_CONTAINER });
            if (containers.length > 0) {
                let container = containers[0];

                // If appropriate, repair the container.
                if ((container.hitsMax - container.hits) >= creep.getRepairPower()) {
                    creep.repair(container);
                    return;
                }
            }

            creep.drop(RESOURCE_ENERGY);
        }


        if (creep.needNewOrders()) {
            if (creep.room.name != creep.memory.targetRoom) {
                creep.memory.orders = [{
                    type: Orders.RELOCATE_TO_ROOM,
                    target: creep.memory.targetRoom
                }];
            } else {

                creep.memory.orders = [{
                    type: Orders.HARVEST,
                    target: creep.memory.toMine
                }];

                // If there's a flag adjacent to the source, move there first.
                var src = Game.getObjectById(creep.memory.toMine);
                if (!src) {
                    console.log(creep.name + " is on fire");
                }
                var flags = src.pos.findInRange(FIND_FLAGS, 2);
                if (flags.length == 1) {
                    creep.memory.orders.unshift({
                        type: Orders.MOVE_TO,
                        position: flags[0].pos
                    })
                }
            }
        }

        roleBase.run(creep);
    }
};
