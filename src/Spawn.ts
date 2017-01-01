import * as CreepNaming from "./CreepNaming";
import {Role} from "./roles/Role";

Spawn.prototype.spawnCreep = function(this:Spawn, role: Role, blueprint: string[], initialMemory: CreepMemory) {
    let creepName = CreepNaming.getCreepName(role.name);

    // Try to create the creep, releasing the name back to the pool if doing so fails.
    let result = this.createCreep(blueprint, creepName, initialMemory);
    if (result != OK) {
        CreepNaming.discardLastName(role.name);
    } else {
        // Initialise the creep's memory.
        let newCreep = Game.creeps[creepName];
        newCreep.memory = initialMemory;
        newCreep.memory.role = role.name;

        if (role.initialise) {
            role.initialise(newCreep);
        }
    }

    return result;
};

Spawn.prototype.isBusy = function(this: Spawn) {
    if (this.spawning) {
        return true;
    }

    let renewers = this.room.memory.renewers;
    return renewers[this.name] != undefined;
};


declare global {
    interface Spawn {
        /**
         * Returns true iff the spawner is renewing or spawning something.
         */
        isBusy(): boolean,

        /**
         * Asks the spawner to make a new creep for a given role, blueprint, and initial configuration.
         * Return value as the builtin Spawn.createCreep().
         * TODO: Probably needs further tidying up...
         */
        spawnCreep(role: Role, blueprint: string[], initialMemory: CreepMemory): number | string;
    }
}
