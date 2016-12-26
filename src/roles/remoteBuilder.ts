var roleBase = require('role.base');
var Orders = require('orders');

function synthesiseOrders(creep) {
    if (creep.needNewOrders()) {
        if (creep.carry.energy == 0) {
            // If you're out of resources, go get more.
            creep.giveOrder({
                type: Orders.WITHDRAW,
                target: creep.memory.src,
                resource: RESOURCE_ENERGY,
                persist: true
            });
        } if (creep.room.name != creep.memory.targetRoom) {
            creep.giveOrder({
                type: Orders.RELOCATE_TO_ROOM,
                target: creep.memory.targetRoom
            });
        } else {
            // We have energy, we're in the right room: let's build shit!
            var selection = creep.pos.findClosestByPath(FIND_MY_CONSTRUCTION_SITES);
            if (selection) {
                creep.giveOrder({
                    type: Orders.BUILD,
                    target: selection.id
                });

                return;
            }
        }
    }
}

/**
 * Suicidally build things in other rooms.
 */
module.exports = {
    run: function(creep) {
        // Parameters:
        //   targetRoom: The ID of the room to go to.
        //   src: Where to get resources from.
        //   homeRoom: The room to return to for repairs (or unset if this drone
        //             shall work itself to death)
        if (!creep.memory.src) {
            console.log(creep.name + " awaiting instructions");
            return;
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
};
