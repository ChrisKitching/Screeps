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
    "RECYCLE" |
    "MOVE_TO" |
    "MOVE_DIRECTION" |
    "RELOCATE_TO_ROOM" |
    "RESERVE" |
    "CLAIM";

export interface Job {
    type: JobType;
}

/**
 * Base class for orders that act upon a single RoomObject.
 */
export interface SingleSubjectJob {
    /**
     * The ID of the subject of the order. The game entity to repair/attack/whatever.
     */
    target: string;
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
}

/**
 * Move to and repair the given structure, stopping when it is fixed or we run out of resources.
 * Stops when we are empty, or the repairs are complete.
 */
export interface Repair extends SingleSubjectJob {
    type: "REPAIR";
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

    // The type of thing to fill it with (a RESOURCE_* value)
    // TODO: Type this shit?
    resource: string
}

/**
 * Withdraw resources from the given subject.
 *
 * Exact opposite of Fill.
 */
export interface Withdraw extends SingleSubjectJob {
    type: "WITHDRAW";

    // The type of thing to fill it with (a RESOURCE_* value)
    // TODO: Type this shit?
    resource: string
}

/**
 * Move to and build the given structure. Stops when the creep runs out of carried energy, or the
 * structure is complete or stops existing.
 */
export interface Build extends SingleSubjectJob {
    type: "BUILD";
}

/**
 * Pursue and attack the given creep or structure. Stops when it is dead, we are dead, or either of
 * us leaves the room.
 */
export interface Attack extends SingleSubjectJob {
    type: "ATTACK";
}

/**
 * Move to and update the controller repeatedly. Stop when the creep is empty (so this is a no-op if
 * the creep is initially empty).
 */
export interface UpgradeController extends Job {
    type: "UPGRADE_CONTROLLER";
}

/**
 * Move to and harvest the given mineral, energy source, or dropped energy, until either:
 * - It is depleted.
 * - The creep is full.
 * - 100 ticks have elapsed since the harvesting started. TODO: Do we actually want this?
 */
export interface Harvest extends SingleSubjectJob {
    type: "HARVEST";
}

/**
 * Causes the unit to find the nearest spawner and recycle itself there.
 * No-op if given in a room with no spawner.
 */
export interface Recycle extends SingleSubjectJob {
    type: "RECYCLE";
}

/**
 * Causes the creep to go to the target spawner and renew.
 * This order is deemed complete with the creep is finished renewing, or
 * when the room runs out of resources.
 */
export interface Renew extends SingleSubjectJob {
    type: "RENEW";
}

/**
 * Move a single square in a given direction.
 */
export interface MoveDirection extends Job {
    type: "MOVE_DIRECTION";

    // One of the direction constants.
    // LEFT, RIGHT, TOP, BOTTOM, TOP_LEFT, TOP_RIGHT, BOTTOM_RIGHT, BOTTOM_LEFT.
    direction: string;
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
export interface Reserve extends Job {
    type: "RESERVE";

    message?: string;
}

/**
 * Claim the room we are in.
 *
 * Causes the creep to move to the controller and claim the room we are in.
 * The controller is signed with `message`, if given.
 */
export interface Claim extends Job {
    type: "CLAIM";

    //  WE ARE THE BORG.
    message?: string;
}
