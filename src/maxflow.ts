type Vertex = {
    kind: "Source";
} | {
    kind: "Target";
};

interface Edge {
    from: string;
    to: string;
}

class Graph<V extends Vertex, E extends Edge> {
    edges: E[] = [];
    vertices: {[name: string]: V} = {};
    constructor() {
        console.log("ctor");
        this.edges = [];
        this.vertices = {};
    }
    toString() {
        let result = "digraph foo {";
        for(let vertex in this.vertices) {
            for(let edge of this.edges) {
                if(edge.from == vertex) result += "\n"+vertex + "->" + edge.to +";\n";
            }
        }
        result += "}";
        return result;
    }
}

export function MakeGraph() {
    let g: Graph<Vertex, Edge> = new Graph();
    for(let source of ["W74N59", "W72N59", "W73N58", "W74N57", "W74N58", "W72N57"]) {
        g.vertices[source] = {kind: "Source"};
    }
    for(let target of ["W73N59", "W73N57", "W75N58"]) {
        g.vertices[target] = {kind: "Target"};
    }
    for(let v in g.vertices) {
        for(let exit of _.values<string>(Game.map.describeExits(v))) {
            if(exit in g.vertices) {
                g.edges.push({
                    from: v,
                    to: exit
                });
            }
        }
    }
    return g;
}
