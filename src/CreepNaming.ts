/**
 * Allocate a new unique name for a creep of the given type.
 * @param role
 */
export function getCreepName(role:string) {
    let counters = Memory.creepNameCounters;
    if (counters[role] === undefined) {
        counters[role] = 0;
    }

    let ret = role + counters[role];

    counters[role] = (counters[role] + 1) % 1000;

    return ret;
}

/**
 * If you don't actually want the name you just asked for, give it back.
 */
export function discardLastName(role: string) {
    Memory.creepNameCounters[role]--;
}
