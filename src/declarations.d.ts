// All buildings that can be filled with energy.
type EnergyFillableStructure = StructureSpawn | StructureExtension | StructureLab | StructureTower | StructureNuker | StructurePowerSpawn

interface RoomMemory {
    slots: {
        [role: string]: {
            [slot:string] : string;
        }
    }
}

interface CreepMemory {

}

interface SpawnMemory {

}

interface Memory {
    // Per-role counters used to give creeps unique names. Creeps are named `$ROLE + creepNum[$ROLE]`.
    // The counters here are done modulo 1000.
    creepNameCounters: {
        [role: string]: number;
    }

    // Rooms have RoomMemory, creeps have CreepMemory, towers have TowerMemory... etc.
    rooms: {[roomName: string]: RoomMemory};
    towers: {[towerId: string]: TowerMemory};
    creeps: {[creepName: string]: CreepMemory};
    spawns: {[spawnName: string]: SpawnMemory};
}
