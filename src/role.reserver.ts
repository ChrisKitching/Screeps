import {creepsTargeting, getOrCreateFlag} from "./logistics";

function getReservationTargets() {
    let targets: [string, number][] = [];
    for(let flagName in Game.flags) {
        if(flagName.indexOf("Reserve") != -1) {
            let flag = Game.flags[flagName];
            if(!flag.room) {
                targets.push([flagName, 0]);
                continue;
            }
            let reservation = flag.room.controller.reservation;
            if(!reservation) {
                targets.push([flagName, 0]);
                continue;
            }
            else if(reservation.ticksToEnd < 3000) {
                targets.push([flagName, reservation.ticksToEnd]);
            }
        }
    }
    targets.sort((t1, t2) => {
        return t1[1] < t2[1] ? -1 : 1
    });
    return targets;
}

function pickReservationTarget(creep) {
    if(creep.memory.target) {
        return Game.flags[creep.memory.target];
    }
    for(let [target, ticks] of getReservationTargets()) {
        if(creepsTargeting(target) == 0) {
            console.log("Picked", target, "with ticks", ticks, "for", creep.name);
            creep.memory.target = target;
            return target;
        }
    }
    return getReservationTargets().pop();
}

module.exports = {
    blueprint: [CLAIM, CLAIM, MOVE, MOVE],
    countFn: () => getReservationTargets().length,
    priority: 7,
    name: "reserver",
    run: function(creep, idx, spawn) {
        let target = pickReservationTarget(creep);
        if(!creep.pos.isNearTo(target)) {
            getOrCreateFlag(creep).setPosition(target);
            creep.moveTo(target);
            return;
        }
        let source = creep.room.controller;
        let result = creep.reserveController(source);
        if(result == ERR_NOT_IN_RANGE) {
            creep.moveTo(source);
        }
	}
};
