import {W71N53} from "./W71N53"
import {W72N54} from "./W72N54"
import {W72N55} from "./W72N55"
import {RoomConfiguration} from "./RoomConfiguration";

// Your own username.
export let ME = "ckitching";

/**
 * People we don't kill.
 */
export let whitelist = [
    "Sheeo",
    "Atanner"
];

// TODO: Sheeo, how do I make this not suck? :P
let roomConfig: {[roomName: string] : RoomConfiguration} = {
    "W71N53": W71N53,
    "W72N54": W72N54,
    "W72N55": W72N55,
};

/**
 * Gets the room configuration table for the given room, if any.
 */
export function getRoomConfiguration(roomName: string) {
    return roomConfig[roomName];
}
