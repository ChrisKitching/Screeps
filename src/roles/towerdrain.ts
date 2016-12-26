var roleBase = require('role.base');
var Orders = require('orders');

/**
 * Walk into room, get shot for a while, leave room, heal.
 */
module.exports = {
    run: function(creep) {
        creep.heal(creep);

        if (!creep.memory.targetRoom || !creep.memory.homeRoom) {
            console.log("Towerdrain awaiting instructions");
            return;
        }

        if (creep.hits <= 1500 && creep.room.name != creep.memory.homeRoom) {
            if (creep.memory.currentOrder && creep.memory.currentOrder.type != Orders.RELOCATE_TO_ROOM) {
                creep.stop();
            }

            creep.memory.orders = [
                {
                    type: Orders.RELOCATE_TO_ROOM,
                    target: creep.memory.homeRoom
                }
            ]
        }

        if (creep.needNewOrders() && creep.hits == creep.hitsMax) {
            if (creep.room.name != creep.memory.targetRoom) {
                if (creep.hits == creep.hitsMax) {
                    creep.memory.orders = [
                        {
                            type: Orders.RELOCATE_TO_ROOM,
                            target: creep.memory.targetRoom
                        }
                    ]
                }
            }
        }

        roleBase.run(creep);
    }
};
