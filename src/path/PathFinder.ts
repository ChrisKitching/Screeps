// Making the PathFinder module not suck.

// These values match those of the builtin Screeps direction constants.
enum Direction {
    TOP = 1,
    TOP_RIGHT = 2,
    RIGHT = 3,
    BOTTOM_RIGHT = 4,
    BOTTOM = 5,
    BOTTOM_LEFT = 6,
    LEFT = 7,
    TOP_LEFT = 8
}

/**
 * Convert a path returned from PathFinder.search to a more compact representation.
 *
 * The PathFinder module gives you paths as an array of RoomPosition objects, which are pretty
 * large. This converts that to a sequence of Directions (which if moved along will have the same
 * effect).
 * @param path
 */
// PathFinder.prototype.normalisePath = function(path: RoomPosition[]): Direction[] {
//
// }
