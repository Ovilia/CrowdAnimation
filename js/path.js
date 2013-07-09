function PathFinder(map) {
    this.map = map;
}

PathFinder.prototype = {
    explore: function(startX, startY) {
        var current = startX + startY * gb.xCnt;
        // move +x, -x, +y, -y
        var move = [{x: 1}, {x: -1}, {y: 1}, {y: -1}];
        var step = [1, -1, gb.xCnt, -gb.xCnt];
        var stepId = Math.floor(Math.random(4));
        for (var i = 0; i < 4; ++i) {
            if (this.map[current + step[stepId]] === System.MAP_TYPES.ROAD) {
                return new Path(startX, startY, [move[current + step[stepId]]]);
            }
            stepId += 1;
            if (stepId >= 4) {
                stepId -= 4;
            }
        }
        // no path
        return null;
    },
    
    findPath: function(startX, startY, desX, desY) {
        var moves = [];
        var dx = desX - startX;
        if (desX > startX) {
            for (var i = 0; i < dx; ++i) {
                moves.push({x: 1});
            }
        } else {
            for (var i = 0; i < dx; ++i) {
                moves.push({x: -1});
            }
        }
        
        var dy = desY - startY;
        if (desY > startY) {
            for (var i = 0; i < dy; ++i) {
                moves.push({y: 1});
            }
        } else {
            for (var i = 0; i < dy; ++i) {
                moves.push({y: -1});
            }
        }
        return new Path(startX, startY, moves);
    }
};



// startX and startY are index of roads
// steps is an array in the form of:
// [{x: 2}, {y: -3}, ...]
function Path(startX, startY, steps) {
    this.start = {
        x: startX,
        y: startY
    };
    
    this.steps = steps;
    var len = this.steps.length;
    for (var i = 0; i < len; ++i) {
        this.steps[i].absX = startX + this.steps[i].x || 0;
        this.steps[i].absY = startY + this.steps[i].y || 0;
        startX = this.steps[i].absX;
        startY = this.steps[i].absY;
    }
    
    this.current = 0;
}
