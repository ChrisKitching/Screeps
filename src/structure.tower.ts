/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('structure.tower');
 * mod.thing == 'a thing'; // true
 */

export function run(tower, spawn, ix) {
    if(tower.energy == 0) {
        return;
    }
    for(let creep of tower.room.find(FIND_CREEPS)) {
        if(creep.owner == "ckitching" || creep.my) {
            if(creep.hits < creep.hitsMax) {
                if(creep.body.find(b => b.type == HEAL)) continue;
                tower.heal(creep);
            }
            continue;
        }
        return tower.attack(creep);
    }
    if(ix == 0) {
        for(let structure of tower.room.find(FIND_STRUCTURES, {
            filter: s => (s.hits < s.hitsMax-800) && (s.structureType != STRUCTURE_WALL)
        })) {
            return tower.repair(structure);
        }
    }
}
