const profiler = require('./profiler');

import {Brain} from "./brain";

require("./creep");
require("./spawn");
require("./room");
require('./maxflow');

PathFinder.use(true);

profiler.enable();

let brain = new Brain();
export function loop() {
    for(let name in Memory.creeps) {
        if(!Game.creeps[name]) {
            let flag = Game.flags[name];
            if(flag) flag.remove();
            flag = Game.flags[name+'-dest'];
            if(flag) flag.remove();
            delete Memory.creeps[name];
        }
    }
    profiler.wrap(() => {
        brain.tick();
    });
}
