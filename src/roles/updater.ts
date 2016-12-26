var roleBase = require('role.base');
var Orders = require('orders');

function synthesiseOrders(creep) {
    if (!creep.needNewOrders()) {
        return
    }

    creep.memory.orders = [
        {
            type: Orders.WITHDRAW,
            target: creep.memory.src,
            resource: RESOURCE_ENERGY
        },
        {
            type: Orders.UPGRADE_CONTROLLER
        }
    ];
}

/**
 * Takes resources from the specified storage and uses them to upgrade the controller.
 */
module.exports = {
    run: function(creep) {
        if (!creep.memory.src) {
            console.log("Updater awaiting instructions");
        }

        synthesiseOrders(creep);
        roleBase.run(creep);
        synthesiseOrders(creep);
        roleBase.run(creep);
    }
};
