import {RoleName} from "./Roles";


export interface Role {
    name: RoleName;

    /**
     * Called when the job queue is empty to generate more work.
     */
    synthesiseNewJobs(creep: Creep): void;

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
}
