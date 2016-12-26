var roleBase = require('role.base');
var Orders = require('orders');

/**
 * Suicidal creep that goes to a room and claims it. And then does nothing else...
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
                        type: Orders.CLAIM
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
