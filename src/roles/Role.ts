import {RoleName} from "./Roles";


export interface Role {
    name: RoleName;

    /**
     * Called when the job queue is empty to generate more work.
     */
    synthesiseNewJobs(creep: Creep): void;

    /**
     * Given a maximum energy cost, get the best creep of this type that is possible.
     */
    getBlueprint(budget: number): string[];

    /**
     * Called every tick before the job queue is processed, to do special actions.
     * If this function returns true, the job queue is not processed this tick.
     *
     * If omitted, the behaviour is as if this function were `return false`.
     */
    tick?(creep: Creep): boolean;

    /**
     * Called once when the unit is created. Useful for initialising memory and so on.
     */
    initialise?(creep: Creep): void;

    /**
     * Given a proposed new creep and its configuration, decide whether we should actually spawn it.
     * Roughly, this corresponds to answering the question "Is this configuration pointful?"
     * An example of a temporarily pointless configuration would be a miner that is configured to
     * target a now-depleted mineral deposit.
     */
    shouldSpawn?(state: CreepMemory): void;
}
