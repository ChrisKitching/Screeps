/**
 * The valid order type names.
 */
type OrderType =
    "FILL" |
    "WITHDRAW" |
    "ATTACK" |
    "REPAIR" |
    "BUILD" |
    "DISMANTLE" |
    "UPGRADE_CONTROLLER" |
    "HARVEST" |
    "REFRESH" |
    "RECYCLE" |
    "MOVE_TO" |
    "MOVE_DIRECTION" |
    "RELOCATE_TO_ROOM" |
    "RESERVE" |
    "CLAIM";

interface Order {
    type: OrderType;


}

/**
 * Base class for orders that act upon a single RoomObject.
 */
interface SingleSubjectOrder {
    // The thing to attack/repair/whatever.
    target: RoomObject;
}

/**
 * Move to the given position or object.
 * Stops when we are within `closeness` of the target.
 */
interface MoveTo extends Order {
    type: "MOVE_TO";

    // Where to move to: either a position, or an object in the world with a position.
    target: RoomPosition | RoomObject;

    // The linear distance from the target which, when reached, has us consider ourselves done.
    // If omitted, interpreted as 1 (adjacent to target).
    closeness: number | undefined;
}

/**
 * Move to and repair the given structure, stopping when it is fixed or we run out of resources.
 * Stops when we are empty, or the repairs are complete.
 */
interface Repair extends SingleSubjectOrder {
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
interface Fill extends SingleSubjectOrder {
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
interface Withdraw extends SingleSubjectOrder {
    type: "WITHDRAW";

    // The type of thing to fill it with (a RESOURCE_* value)
    // TODO: Type this shit?
    resource: string
}

/**
 * Move to and build the given structure. Stops when the creep runs out of carried energy, or the
 * structure is complete or stops existing.
 */
interface Build extends SingleSubjectOrder {
    type: "BUILD";
}

/**
 * Pursue and attack the given creep or structure. Stops when it is dead, we are dead, or either of
 * us leaves the room.
 */
interface Attack extends Order {
    type: "ATTACK";
}

/**
 * Move to and update the controller repeatedly. Stop when the creep is empty (so this is a no-op if
 * the creep is initially empty).
 */
interface UpgradeController extends Order {
    type: "UPGRADE_CONTROLLER";
}

/**
 * Move to and harvest the given mineral, energy source, or dropped energy, until either:
 * - It is depleted.
 * - The creep is full.
 * - 100 ticks have elapsed since the harvesting started. TODO: Do we actually want this?
 */
interface Harvest extends SingleSubjectOrder {
    type: "HARVEST";
}

/**
 * Causes the unit to find the nearest spawner and recycle itself there.
 * No-op if given in a room with no spawner.
 */
interface Recycle extends SingleSubjectOrder {
    type: "RECYCLE";
}

/**
 * Move a single square in a given direction.
 */
interface MoveDirection extends Order {
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
interface RelocateToRoom extends Order {
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
interface Reserve extends Order {
    type: "RESERVE";

    message: string | undefined;
}

/**
 * Claim the room we are in.
 *
 * Causes the creep to move to the controller and claim the room we are in.
 * The controller is signed with `message`, if given.
 */
interface Claim extends Order {
    type: "CLAIM";

    message: string | undefined;
}
