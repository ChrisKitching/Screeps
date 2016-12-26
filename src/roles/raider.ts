var roleBase = require('role.base');
var Orders = require('orders');

function synthesiseOrders(creep) {
    // If damaged, FLEE.
    if (creep.hits <= 2700 && creep.room.name != creep.memory.homeRoom) {
        if (creep.memory.currentOrder && creep.memory.currentOrder.type != Orders.RELOCATE_TO_ROOM) {
            creep.stop();
        }

        creep.memory.orders = [
            {
                type: Orders.RELOCATE_TO_ROOM,
                target: creep.memory.homeRoom
            }
        ]

        return;
    }

    // No other interrupts needed...
    if (!creep.needNewOrders()) {
        return;
    }

    // If at home and healed, go back into the battle.
    if (creep.hits == creep.hitsMax && creep.room.name == creep.memory.homeRoom) {
        creep.memory.orders = [
            {
                type: Orders.RELOCATE_TO_ROOM,
                target: creep.memory.targetRoom
            }
        ]

        return;
    }

    // If in the battle, find another target.
    if (creep.room.name == creep.memory.targetRoom) {
        var target = creep.pos.findClosestByPath(creep.room.getEnemies());

        if (target != undefined) {
            creep.say("KILL");

            creep.memory.orders = [
                {
                    type: Orders.ATTACK,
                    target: target.id
                }
            ]
        }
    }
}

module.exports = {
    run: function(creep) {
        if (!creep.memory.targetRoom || !creep.memory.homeRoom) {
            console.log("Raider awaiting instructions");
            return;
        }

        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
};
