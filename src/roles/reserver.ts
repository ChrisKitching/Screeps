var roleBase = require('role.base');
var Orders = require('orders');

/**
 * Suicidal creep that goes to a room and reserves it as much as possible.
 */
module.exports = {
    run: function(creep) {
        // Require that Memory.target be set to the room name
        if (!creep.memory.target) {
            console.log(creep.name + " awaiting instructions");
            return;
        }

        if (creep.needNewOrders()) {
            if (creep.room.name == creep.memory.target) {
                roleBase.giveOrder(creep,
                    {
                        type: Orders.RESERVE
                    });
            } else {
                roleBase.giveOrder(creep,
                    {
                        type: Orders.RELOCATE_TO_ROOM,
                        target: creep.memory.target
                    }
                );
            }
        }

        roleBase.run(creep);
    }
};
