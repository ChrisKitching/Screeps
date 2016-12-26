var roleBase = require('role.base');
var Orders = require('orders');

Creep.prototype.recycle = function () {
    this.memory.role = "base";
    this.memory.currentOrder = undefined;
    this.memory.orders = [{
        type: Orders.RECYCLE
    }];
};

Creep.prototype.giveOrder = function (order) {
    if (this.memory.orders == undefined) {
        this.memory.orders = []
    }

    this.memory.orders.push(order);
};

Creep.prototype.stop = function () {
    this.memory.orders = [];
    this.memory.currentOrder = undefined;
};

Creep.prototype.needNewOrders = function () {
    return !this.memory.orders || this.memory.orders.length == 0 && this.memory.currentOrder == undefined;
};

// TODO: Questionable placement?
Creep.prototype.getRepairPower = function () {
    return this.getActiveBodyparts(WORK) * 100;
};


declare global {
    interface Creep {
        recycle(): void;
        giveOrder(): Order;
        stop(): void;
        needNewOrders(): boolean;
        getRepairPower(): number;
    }
}
