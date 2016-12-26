function repeat(string, i): string[] {
    let vals: string[] = [];
    for(let j = 0; j < i; j++) {
        vals.push(string);
    }
    return vals;
}
export const blueprint = repeat(TOUGH, 30).concat(repeat(MOVE, 20));
export const count = 0;
export const priority = 9;
export const name = "builder";

export function run(creep, idx, spawn) {

}
