var roleBase = require('role.base');
var Orders = require('orders');


function scoopage(creep) {
    var dropped = creep.room.lookForAt(LOOK_ENERGY, creep);
    if (dropped.length > 0) {
        creep.pickup(dropped[0]);
    }
}

function synthesiseOrders(creep) {
    if (!creep.needNewOrders()) {
        return;
    }


    if (_.sum(creep.carry) == creep.carryCapacity) {
        creep.memory.orders = [
            {
                type: Orders.FILL,
                target: creep.memory.dst
            }
        ]
    } else {
        var flagToUse = Game.flags[creep.memory.scoopFlags[creep.memory.scoopIndex]];
        if (flagToUse.room) {
            creep.memory.scoopIndex = (creep.memory.scoopIndex + 1) % creep.memory.scoopFlags.length;

            // Find dropped energy at the endpoint.
            var energyfound = flagToUse.room.lookForAt(LOOK_ENERGY, flagToUse);

            if (energyfound[0] && energyfound[0].energy > 100) {
                creep.giveOrder(
                    {
                        type: Orders.HARVEST,
                        target: energyfound[0].id
                    }
                )
            }

            var targetContainers = flagToUse.room.lookForAt(LOOK_STRUCTURES, flagToUse).filter(function(structure) { return structure.structureType == STRUCTURE_CONTAINER });
            if (targetContainers.length > 0) {
                creep.giveOrder(
                    {
                        type: Orders.WITHDRAW,
                        target: targetContainers[0].id,
                        persist: false
                    }
                );
            }
        }
    }
}

module.exports = {
    run: function(creep) {
        if (creep.memory.scoopIndex == undefined) {
            creep.memory.scoopIndex = 0;
        }

        if (!creep.memory.scoopFlags || !creep.memory.dst) {
            console.log("remoteMover awaiting orders");
            return;
        }

        // Scoop anything you walk over.
        if (creep.carry.energy < creep.carryCapacity) {
            scoopage(creep);
        }

        // If we're in a room without a tower, and we're on a road with damage,
        // and we have energy, repair it.
        if (creep.getActiveBodyparts(WORK) > 0 &&
            creep.carry.energy > 0) {
            if (!creep.room.hasTower()) {
                var stuff = creep.room.lookForAt(LOOK_STRUCTURES, creep);

                for (j in stuff) {
                    var thing = stuff[j];

                    if ((thing.hitsMax - thing.hits) >= 100) {
                        creep.repair(thing);
                    }
                }
            }
        }

        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
}
