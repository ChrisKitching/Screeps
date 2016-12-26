import {creepsTargeting, getOrCreateFlag} from "./logistics";
function pickForageTarget(creep) {
    for(let i=0; i<count;i++) {
        let site = "Forage"+i;
        if(creepsTargeting(site, "forager") == 0) {
            creep.memory.target = site;
            return site;
        }
    }
}

export const name = "forager";
export const blueprint = [WORK, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE];
export const count = 8;
export const priority = 1;
export function run (creep, idx, spawn) {
    if(!creep.memory.target) {
        pickForageTarget(creep);
    }
    // forage
    if(!Game.flags[creep.memory.target]) return;
    let target = Game.flags[creep.memory.target].pos;
    if(!creep.pos.isNearTo(target)) {
        getOrCreateFlag(creep).setPosition(target);
        creep.moveTo(target);
        return;
    }
    let source = target.lookFor(LOOK_SOURCES)[0];
    let result = creep.harvest(source);
    if(result == ERR_NOT_IN_RANGE) {
        creep.moveTo(source);
    }
    else if(result == -1) {
        creep.moveTo(Game.spawns['Spawn1']);
        creep.memory.destroy = true;
    }
}
