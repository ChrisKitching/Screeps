function repeat(string, i) {
    let vals = [];
    for(let j = 0; j < i; j++) {
        vals.push(string);
    }
    return vals;
}
export const blueprint =
    repeat(TOUGH, 24)
    .concat(repeat(MOVE, 16))
    .concat(repeat(ATTACK, 8));

export const count = 0;
export const priority = 9;
export const name = "builder";

export function run(creep, idx, spawn) {

}
