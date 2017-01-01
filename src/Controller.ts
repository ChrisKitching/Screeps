import {whitelist, ME} from "./config/global";

/**
 * Returns true iff a unit should be allowed to continue existing.
 */
export function isFriendly(o: {owner: Owner}) {
    if (o.owner.username == ME) {
        return true;
    }

    return whitelist.indexOf(o.owner.username) != -1;
}
