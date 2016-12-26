import {Task} from "./tasks";

export const StaticJobs: Task[] = [
    {
        kind: "Forage",
        target: "5836b6bb8b8b9619519ef3b7",
        targetPos: {x: 17, y: 34},
        targetRoom: "W74N57",
        deposit: [2,22,"W73N57"]
    },
    {
        kind: "Forage",
        target: ["5836b6e78b8b9619519ef8b3", "5836b6e78b8b9619519ef8b5"],
        targetRoom: "W72N57",
        targetPos: {x: 2, y: 24},
        deposit: [47,21,"W73N57"]
    },
    {
        kind: "Forage",
        target: ["5836b6a38b8b9619519ef0db", "5836b6a38b8b9619519ef0da"],
        targetRoom: "W75N58",
        targetPos: {x: 5, y: 9},
        deposit: [3,15,"W75N58"]
    }
];
