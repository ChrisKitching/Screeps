/**
 * Does the same job as RoomPosition.getRangeTo, only significantly more cheaply.
 *
 * Note that the geometry of screeps is a little surprising: diagonals are worth 1, not
 * sqrt(2).
 *
 * This assumes the points are in the same room.
 */
export function distanceBetween(p1: RoomPosition, p2: RoomPosition): number {
    if (p1.roomName != p2.roomName) {
        return 999999999;
    }

    return Math.max(Math.abs(p1.x - p2.x), Math.abs(p1.y - p2.y));
};

/**
 * Returns true iff this RoomPosition is adjacent to the given one.
 */
export function adjacent(p1: RoomPosition, p2: RoomPosition): boolean {
    return distanceBetween(p1, p2) == 1;
};
