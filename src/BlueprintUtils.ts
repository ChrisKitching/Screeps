/**
 * Calculate the cost of building a given blueprint.
 */
export function cost(bp: string[]) {
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

/**
 * Build a blueprint from a set of parts.
 */
export function fromRepeatedParts(budget: number, parts: string[][]) {
    let bp: string[] = [];
    let partIndex = 0;

    while (budget >= cost(parts[partIndex]) && bp.length <= parts[partIndex].length) {
        bp.concat(parts[partIndex]);
        budget -= cost(parts[partIndex]);
        partIndex = (partIndex + 1) % parts.length;
    }

    return bp;
}
