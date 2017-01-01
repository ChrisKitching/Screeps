/**
 * The valid order type names.
 */
export type JobType =
    "FILL" |
    "WITHDRAW" |
    "ATTACK" |
    "REPAIR" |
    "BUILD" |
    "DISMANTLE" |
    "UPGRADE_CONTROLLER" |
    "HARVEST" |
    "RENEW" |
    "HEAL" |
    "RECYCLE" |
    "MOVE_TO" |
    "MOVE_DIRECTION" |
    "RELOCATE_TO_ROOM" |
    "RESERVE" |
    "CLAIM";

export enum JobCompletionStatus {
    DONE,
    NOT_DONE,
    FAILED,

    // Used when a job has been swapped for another job.
    PREEMPT
}

export interface Job {
    type: JobType;
}


/**
 * Base class for orders that act upon a single RoomObject.
 */
export interface SingleSubjectJob extends Job {
    /**
     * The ID of the subject of the order. The game entity to repair/attack/whatever.
     */
    target: string;

    // The maximum range at which this job can actually be carried out (set by subclasses).
    range: number;
}

export interface ControllerSubjectJob extends Job {
    // The maximum range at which this job can actually be carried out (set by subclasses).
    range: number;
}

/**
 * Move to the given position or object.
 * Stops when we are within `closeness` of the target.
 */
export interface MoveTo extends Job {
    type: "MOVE_TO";

    // Where to move to: either a position, or the ID of an object in the world with a position.
    target: RoomPosition | string;

    // The linear distance from the target which, when reached, has us consider ourselves done.
    // If omitted, interpreted as 1 (adjacent to target).
    closeness?: number;

    // Optional options to pass to the builtin pathfinder.
    // TODO: Remove once flowfield is a thing?
    options?: MoveToOpts;

    // If set, will cache the entire route on startup to save resources.
    // The downside of this is that deadlock is possible in the presence of traffic.
    useCaching?: boolean;

    // The route to follow. You can set this yourself, otherwise it may be calculated as part of job
    // desugaring.
    route?: RoomPosition[];
}

/**
 * Move to and repair the given structure, stopping when it is fixed or we run out of resources.
 * Stops when we are empty, or the repairs are complete.
 */
export interface Repair extends SingleSubjectJob {
    type: "REPAIR";
    range: 3;
}

/**
 * Move to and fill the given structure.
 *
 * Dumps the resources carried by this creep into the given container, storage, tower, lab,
 * other creep, etc.
 * The maximum possible amount will be transferred of the specified resource type (or everything
 * if none is specified).
 */
export interface Fill extends SingleSubjectJob {
    type: "FILL";
    range: 1;

    // The type of thing to fill it with (a RESOURCE_* value). If omitted, we try to transfer all
    // that is carried, of all types.
    // TODO: Type this shit?
    resource?: string
}

/**
 * Withdraw resources from the given subject.
 *
 * Exact opposite of Fill.
 */
export interface Withdraw extends SingleSubjectJob {
    type: "WITHDRAW";
    range: 1;

    // The type of thing to fill it with (a RESOURCE_* value)
    // TODO: Type this shit?
    resource: string,

    // If true, sit at the container until enough energy is available to fill yourself.
    // If false or omitted, just visit the target, take what's there, and call it a day.
    persist?: boolean;
}

/**
 * Move to and build the given structure. Stops when the creep runs out of carried energy, or the
 * structure is complete or stops existing.
 */
export interface Build extends SingleSubjectJob {
    type: "BUILD";
    range: 3;
}

/**
 * Move to and dismantle the given structure.
 */
export interface Dismantle extends SingleSubjectJob {
    type: "DISMANTLE";
    range: 1;
}

/**
 * Pursue and attack the given creep or structure. Stops when it is dead, we are dead, or either of
 * us leaves the room.
 */
export interface Attack extends SingleSubjectJob {
    type: "ATTACK";
    range: 3;
}

/**
 * Pursue and heal the given creep. Stops when it is dead, we are dead, either of us leaves the
 * room, or the target is fully healed.
 */
export interface Heal extends SingleSubjectJob {
    type: "HEAL";
    range: 3;
}

/**
 * Move to and update the controller repeatedly. Stop when the creep is empty (so this is a no-op if
 * the creep is initially empty).
 */
export interface UpgradeController extends ControllerSubjectJob {
    type: "UPGRADE_CONTROLLER";
    range: 3;
}

/**
 * Move to and harvest the given mineral, energy source, or dropped energy, until either:
 * - It is depleted.
 * - The creep is full.
 * - 100 ticks have elapsed since the harvesting started. TODO: Do we actually want this?
 */
export interface Harvest extends SingleSubjectJob {
    type: "HARVEST";
    range: 1;
}

/**
 * Causes the unit to find the nearest spawner and recycle itself there.
 * No-op if given in a room with no spawner.
 */
export interface Recycle extends SingleSubjectJob {
    type: "RECYCLE";
    range: 1;
}

/**
 * Causes the creep to go to the target spawner and renew.
 * This order is deemed complete with the creep is finished renewing, or
 * when the room runs out of resources.
 */
export interface Renew extends SingleSubjectJob {
    type: "RENEW";
    range: 1;
}

/**
 * Move a single square in a given direction.
 */
export interface MoveDirection extends Job {
    type: "MOVE_DIRECTION";

    // One of the direction constants.
    // LEFT, RIGHT, TOP, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT.
    direction: number;
}


/**
 * Move to another room, even if we have no visibility there.
 *
 * This order moves the creep to the given room.
 * If the endpoint room contains a flag with the same name as the room, the creep will move to that
 * flag. Otherwise, the creep will move to an arbitrary point one square away from an entry point
 * to the room.
 */
export interface RelocateToRoom extends Job {
    type: "RELOCATE_TO_ROOM";

    // The name of the room to move to.
    targetRoom: string;
}

/**
 * Reserve the room we are in.
 *
 * Causes the creep to move to the controller and begin reserving the room we are in.
 * This order never terminates. The controller is signed with `message`, if given.
 */
export interface Reserve extends ControllerSubjectJob {
    type: "RESERVE";
    range: 1;

    message?: string;
}

/**
 * Claim the room we are in.
 *
 * Causes the creep to move to the controller and claim the room we are in.
 * The controller is signed with `message`, if given.
 */
export interface Claim extends ControllerSubjectJob {
    type: "CLAIM";
    range: 1;

    //  WE ARE THE BORG.
    message?: string;
}

// The jobs that towers can do.
export type TowerJob = Attack | Repair | Heal
