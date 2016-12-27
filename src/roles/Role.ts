export interface Role {
    /**
     * Called when the creep's job queue is empty to generate more work.
     */
    synthesiseNewJobs(creep: Creep): void;

    /**
     * Get a creep blueprint for a creep of this type.
     *
     * @param maxCost The maximum amount of energy the returned blueprint shall cost.
     *                The function may return undefined if the role cannot sensibly be
     *                done within the given energy constraint.
     */
    getBlueprint(maxCost: number): string[] | undefined;

    /**
     * Called every tick before the job queue is processed, to do special actions.
     * If this function returns true, the job queue is not processed this tick.
     *
     * If omitted, the behaviour is as if this function were `return false`.
     */
    tick?(creep: Creep): boolean;

    /**
     * Called once when the creep is spawned. Used for initialising counters and so on.
     */
    onSpawn?(creep: Creep): void;
}
