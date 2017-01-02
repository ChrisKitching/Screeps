import {RoleName} from "../roles/Roles";

export interface RoomConfiguration {
    creeps: {
        [role: string]: CreepMemory[]
    }

    // Sets the order in which units of certain roles are spawned.
    creepPriority: RoleName[];
}
