function Rigid(height, mesh) {
    this.height = height;
    this.mesh = mesh;
    
    // agents inside the rigid, in the form of:
    // [{
    //     agent: xxx,
    //     frames: 0,
    // }]
    this.agents = [];
    this.agentCnt = 0;
    
    this.maxAgentFrames = 500;
}

Rigid.prototype = {
    agentIn: function(agent) {
        this.agents.push({
            agent: agent,
            frames: 0
        });
    },
    
    update: function() {
        for (var i = 0, len = this.agents.length; i < len; ++i) {
            if (this.agents[i]) {
                ++this.agents[i].frames;
                if (this.agents[i].frames > this.maxAgentFrames) {
                    this.agents[i].agent.path = this.getOutPath();
                    this.agents[i].agent.state
                            = this.agents[i].agent.STATE.LEAVING;
                    delete this.agents[i];
                    --this.agentCnt;
                }
            }
        }
    }
};



function Amusement(x1, y1, x2, y2, height, mesh) {
    if (x2 < x1) {
        var tmp = x2;
        x2 = x1;
        x1 = tmp;
    }
    if (y2 < y1) {
        var tmp = y2;
        y2 = y1;
        y1 = tmp;
    }
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.height = height;
    
    this.mesh = mesh;
    
    this.inPos = null;
    this.inMesh = null;
    this.entrance = null;
    
    this.maxAgentFrames = 1000;
}

Amusement.prototype = new Rigid();

Amusement.prototype.setIn = function(x, y, mesh) {
    this.inPos = {
        x: x,
        y: y
    };
    this.inMesh = mesh;
    
    if (x === this.x1 - 1) {
        this.entrance = {
            x: this.x1,
            y: y
        };
    } else if (x === this.x2 + 1) {
        this.entrance = {
            x: this.x2,
            y: y
        };
    } else if (y === this.y1 - 1) {
        this.entrance = {
            x: x,
            y: this.y1
        };
    } else if (y === this.y2 + 1) {
        this.entrance = {
            x: x,
            y: this.y2
        };
    } else {
        console.error('Error entrance position!');
    }
};

Amusement.prototype.getOutPath = function() {
    return new Path(this.entrance.x, this.entrance.y,
            [{x: this.inPos.x, y: this.inPos.y}]);
};



function Shop(x, y, height, mesh) {
    this.x = x;
    this.y = y;
    this.height = height;
    
    this.mesh = mesh;
    
    //this.type = Math.floor(Math.random() * this.protptype.TYPE.length);
}

Shop.prototype = new Rigid();

Shop.prototype.TYPE = {
    FOOD: 0,
    DRINK: 1
};

Shop.prototype.getOutPath = function() {
    var map = gb.system.graph.nodes;
    if (map[this.x - 1][this.y].type === gb.system.MAP_TYPES.ROAD) {
        var path = [{x: this.x - 1, y: this.y}];
    } else if (map[this.x][this.y - 1].type === gb.system.MAP_TYPES.ROAD) {
        var path = [{x: this.x, y: this.y - 1}];
    } else if (map[this.x + 1][this.y].type === gb.system.MAP_TYPES.ROAD) {
        var path = [{x: this.x + 1, y: this.y}];
    } else if (map[this.x][this.y + 1].type === gb.system.MAP_TYPES.ROAD) {
        var path = [{x: this.x, y: this.y + 1}];
    } else {
        console.error('Error in getOutPath!');
    }
    return new Path(this.x, this.y, path);
};
