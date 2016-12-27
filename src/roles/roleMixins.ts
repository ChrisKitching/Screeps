/**
 * A bunch of functions you can call from tick() to add bonus behaviours to creeps.
 */


/**
 * Causes the creep to scoop any energy it walks on.
 */
export function scoopWalkedEnergy(creep: Creep) {
    let dropped = creep.room.lookForAt<Resource>(LOOK_ENERGY, creep);
    if (dropped.length > 0) {
        creep.pickup(dropped[0]);
    }
}

/**
 * Repair any roads that are walked on and in need of repair.
 */
export function repairWalkedRoads(creep: Creep) {
    // If we're in a room without a tower, and we're on a road with damage,
    // and we have energy, repair it.
    if (creep.getActiveBodyparts(WORK) > 0 && creep.carry.energy > 0) {
        let stuff = creep.room.lookForAt<Structure>(LOOK_STRUCTURES, creep);

        for (let j in stuff) {
            let thing = stuff[j];

            if ((thing.hitsMax - thing.hits) >= 100) {
                creep.repair(thing);
            }
        }
    }
}
