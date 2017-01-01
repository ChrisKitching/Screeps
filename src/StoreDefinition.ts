/**
 * Returns true iff the storage contains some of the given resource type.
 * If type is omitted, returns true if the storage is nonempty.
 */
export function contains(store: StoreDefinition, type?: string) {
    if (type === undefined) {
        return !isEmpty(store);
    }

    return store[type] > 0;
}

/**
 * Get the total amount of resources of any type stored.
 */
export function totalStored(store: StoreDefinition) {
    let acc = 0;
    for (let i in store) {
        if (store[i]) {
            acc += store[i];
        }
    }

    return acc;
}

/**
 * Returns true iff the storage is nonempty.
 */
export function isEmpty(store: StoreDefinition) {
    return totalStored(store) == 0;
}



// Provide a consistent interface to storage across the many conflicting things for this.

/**
 * Returns true iff the given RoomObject cannot accept any more of the given resource type (or any,
 * if omitted).
 */
export function isFull(o: Structure, type?: string) {
    // If it uses StoreDefinition, things are simpler.
    if (o instanceof StructureStorage || o instanceof StructureContainer || o instanceof StructureTerminal) {
        return totalStored(o.store) == o.storeCapacity;
    }

    // Things that are inconsistent, but mercifully only have one resource type...
    if (o instanceof StructureTower || o instanceof StructureExtension || o instanceof Spawn || o instanceof StructureLink) {
        if (type && type != RESOURCE_ENERGY) {
            return true;
        }

        return o.energy == o.energyCapacity
    }

    // Things that have their underpants on their heads entirely.
    if (o instanceof StructureLab) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy == o.energyCapacity;
            } else if (type == o.mineralType) {
                return o.mineralAmount == o.mineralCapacity;
            }

            return false;
        }

        return o.energy == o.energyCapacity && o.mineralAmount == o.mineralCapacity;
    }

    if (o instanceof StructureNuker) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy == o.energyCapacity;
            } else if (type == RESOURCE_GHODIUM) {
                return o.ghodium == o.ghodiumCapacity;
            }

            return false;
        }

        return o.energy == o.energyCapacity && o.ghodium == o.ghodiumCapacity;
    }

    if (o instanceof StructurePowerSpawn) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy == o.energyCapacity;
            } else if (type == RESOURCE_POWER) {
                return o.power == o.powerCapacity;
            }

            return false;
        }

        return o.energy == o.energyCapacity && o.power == o.powerCapacity;
    }

    console.log("ERROR: Attempt to figure out fullness of an unknown type!");
    return false;
}


/**
 * Return true iff the structure contains the given resource, or anything if undefined.
 */
export function structureContains(o: Structure, type?: string) {
    // If it uses StoreDefinition, things are simpler.
    if (o instanceof StructureStorage || o instanceof StructureContainer || o instanceof StructureTerminal) {
        return contains(o.store, type);
    }

    // Things that are inconsistent, but mercifully only have one resource type...
    if (o instanceof StructureTower || o instanceof StructureExtension || o instanceof Spawn || o instanceof StructureLink) {
        if (type && type != RESOURCE_ENERGY) {
            return false;
        }

        return o.energy > 0;
    }

    // Things that have their underpants on their heads entirely.
    if (o instanceof StructureLab) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy > 0;
            } else if (type == o.mineralType) {
                return o.mineralAmount > 0;
            }

            return false;
        }

        return o.energy > 0 && o.mineralAmount > 0;
    }

    if (o instanceof StructureNuker) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy > 0;
            } else if (type == RESOURCE_GHODIUM) {
                return o.ghodium > 0;
            }

            return false;
        }

        return o.energy > 0 && o.ghodium > 0;
    }

    if (o instanceof StructurePowerSpawn) {
        if (type) {
            if (type == RESOURCE_ENERGY) {
                return o.energy > 0;
            } else if (type == RESOURCE_POWER) {
                return o.power > 0;
            }

            return false;
        }

        return o.energy > 0 && o.power > 0;
    }

    console.log("ERROR: Attempt to figure out fullness of an unknown type!");
    return false;
}
