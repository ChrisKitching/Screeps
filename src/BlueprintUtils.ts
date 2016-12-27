/**
 * Calculate the cost of building a given blueprint.
 */
export function blueprintCost(bp: string[]) {
    let accumulator = 0;
    for (let i in bp) {
        if (!bp.hasOwnProperty(i)) {
            continue;
        }

        let part = bp[i];
        switch (part) {
            case MOVE:
            case CARRY:
                accumulator += 50;
                break;
            case WORK:
                accumulator += 100;
                break;
            case ATTACK:
                accumulator += 80;
                break;
            case RANGED_ATTACK:
                accumulator += 150;
                break;
            case HEAL:
                accumulator += 250;
                break;
            case CLAIM:
                accumulator += 600;
                break;
            case TOUGH:
                accumulator += 10;
                break;
            default:
                console.log("YOU CAN'T WRITE SOFTWARE");
                break;
        }
    }

    return accumulator;
}

export function unitCost(type, level) {
    return this.blueprintCost(this.getBlueprint(type, level));
}
