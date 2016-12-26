var util = require('util');
var roleBase = require('role.base');
var Orders = require('orders');

function synthesiseOrders(creep) {
    if (!creep.needNewOrders()) {
        return;
    }

    var target = creep.room.getAnEnemy();

    if (target == undefined) {
        creep.heal(creep);

        if (!creep.room.controller) {
            return;
        }

        var pos = creep.room.controller.pos;
        var newPos = new RoomPosition(pos.x, pos.y, pos.roomName);

        roleBase.giveOrder(creep, {
            type: Orders.MOVE_TO,
            target: creep.room.controller.id,
            closeness: 6,
            options: {ignoreDestructibleStructures: true}
        });

        return;
    }

    console.log(creep.name + " has acquired target: " + target.id + " belonging to " + target.owner.username);
    creep.say("KILL");
    roleBase.giveOrder(creep, {
        type: Orders.ATTACK,
        target: target.id
    });
}

module.exports = {
    run: function(creep) {
        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
}
