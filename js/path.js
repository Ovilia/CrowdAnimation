function PathFinder(graph) {
    this.graph = graph;
}

PathFinder.prototype = {
    explore: function(startX, startY) {
        // no path
        return null;
    },
    
    findPath: function(startX, startY, desX, desY) {
        var path = astar.search(this.graph.nodes, this.graph.nodes[startX][startY],
                this.graph.nodes[desX][desY]);
        return new Path(startX, startY, path);
    }
};



// startX and startY are index of roads
// path is the result by astar
function Path(startX, startY, path) {
    this.start = {
        x: startX,
        y: startY
    };
    
    var len = path.length;
    this.steps = new Array(len);
    for (var i = 0; i < len; ++i) {
        this.steps[i] = {
            absX: path[i].x,
            absY: path[i].y,
            x: path[i].x - startX,
            y: path[i].y - startY
        };
        startX = path[i].x;
        startY = path[i].y;
    }
    
    this.current = 0;
}

Path.prototype = {
    add: function(absX, absY) {
        if (this.steps.length > 0) {
            this.steps.push({
                absX: absX,
                absY: absY,
                x: absX - this.steps[this.steps.length - 1].absX,
                y: absY - this.steps[this.steps.length - 1].absY
            });
        } else {
            this.steps.push({
                absX: absX,
                absY: absY,
                x: absX - this.start.x,
                y: absY - this.start.y
            });
        }
    }
}
