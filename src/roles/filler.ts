var roleBase = require('role.base');
var resources = require('resources');
var Orders = require('orders');

function synthesiseOrders(creep) {
    if (creep.needNewOrders()) {
        // If we're empty, fill up.
        if (creep.carry.energy < 100) {
            creep.memory.orders = [
                {
                    type: Orders.WITHDRAW,
                    target: creep.memory.src,
                    resource: RESOURCE_ENERGY
                }
            ]
        } else {
            // Find the nearest thing to fill.
            var target = creep.pos.findClosestByPath(creep.room.getThingsToFill());
            if (target) {
                creep.memory.orders = [
                    {
                        type: Orders.FILL,
                        target: target.id
                    }
                ];
            }

        }
    }
}

/**
 * Fills the spawner, extensions, tower, etc.
 */
module.exports = {
    run: function(creep) {
        // Use a given source.
        if (!creep.memory.src) {
            console.log("Filler awaiting orders");
            return;
        }

        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
};
