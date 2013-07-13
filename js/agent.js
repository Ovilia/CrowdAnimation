function Agent(x, y, z, mesh, maxV) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.mesh = mesh;
    this.s = this.mesh.position;
    
    this.maxV = maxV;
    this.v = {
        x: maxV,
        z: 0
    };
    
    this.state = this.STATE.EXPLORING;
    
    this.dest = null;
    this.path = null;
    
    this.attr = {
        tiredness: 0,
        hunger: 0,
        thirst: 0,
        satisfactory: 0.6
    };
    this.favor = {
        excitement: Math.random(),
        amusement: Math.random(),
        dizziness: Math.random()
    };
    this.money = Math.ceil(Math.random() * 200);
    
    this.findShopThreshold = 0.4 + Math.random() * 0.4;
}

Agent.prototype = {
    STATE: {
        GOING: 0,
        USING: 1,
        EXPLORING: 2,
        WAITING: 3,
        LEAVING: 4,
        EXIT: 5
    },
    
    update: function() {
        if (this.state === this.STATE.EXPLORING) {
            if (this.path === null) {
                // compute path
                this.computeWhereToGo();
            }
        }
        // going along the path
        if (this.path) {
            var step = this.path.steps[this.path.current];
            if (step) {
                // update v
                if (step.x) {
                    this.v.x = step.x * this.maxV;
                    this.v.z = 0;
                } else {
                    this.v.x = 0;
                    this.v.z = step.y * this.maxV;
                }
                
                // rotate agent
                var alpha = (this.v.x === 0) ? Math.PI / 2
                        : Math.atan(this.v.z / this.v.x);
                this.mesh.rotation.y = alpha;
                
                // update s
                this.s.x += this.v.x;
                this.s.z += this.v.z;
                
                // check step
                if ((step.x > 0 && this.s.x >= step.absX - 12) ||
                        (step.x < 0 && this.s.x <= step.absX - 12) ||
                        (step.y > 0 && this.s.z >= step.absY - 12) ||
                        (step.y < 0 && this.s.z <= step.absY - 12)) {
                    // move to next step
                    ++this.path.current;
                }
            } else {
                // end of path
                if (this.state === this.STATE.EXIT) {
                    // exist
                    gb.system.removeAgent(this);
                } else if (this.state === this.STATE.GOING) {
                    // enter shop or amusement
                    this.state = this.STATE.USING;
                    this.dest.agentIn(this);
                } else {
                    this.state = this.STATE.EXPLORING;
                    this.dest = null;
                }                 
                this.path = null;
            }
        }
    },
    
    updateAttr: function(rigidAttr, price) {
        if (rigidAttr && rigidAttr.excitement) {
            // amusement
            if (price > this.money) {
                // cannot afford
                return 0;
            }
            this.money -= price;
            this.attr.tiredness = Math.min(this.attr.tiredness
                    + (rigidAttr.excitement + rigidAttr.dizziness
                    - rigidAttr.amusement) * 0.1, 1);
            this.attr.hunger = Math.min(this.attr.hunger
                    + (rigidAttr.excitement + Math.random()) * 0.2, 1);
            this.attr.thirst = Math.min(this.attr.thirst
                    + (rigidAttr.excitement + Math.random()) * 0.2, 1);
            var satified = Math.min(1, Math.max(0, 1 - price / 200
                    - (Math.abs(this.favor.amusement - rigidAttr.amusement)
                    + Math.abs(this.favor.excitement - rigidAttr.excitement)
                    + Math.abs(this.favor.dizziness - rigidAttr.dizziness))
                    / 5 + Math.random() * 0.25));
            this.attr.satisfactory = this.attr.satisfactory * 0.8
                    + satified * 0.2;
            return satified;
        
        } else if (rigidAttr && rigidAttr.hunger) {
            // shop
            if (price > this.money) {
                // cannot afford
                return 0;
            }
            this.money -= price;
            this.attr.hunger = Math.max(0, this.attr.hunger
                    + rigidAttr.hunger);
            this.attr.thirst = Math.min(1, Math.max(0, this.attr.thirst
                    + rigidAttr.thirst));
            var satified = Math.min(1, Math.max(0,
                    -(rigidAttr.hunger + rigidAttr.thirst) * 2 - price / 100
                    + Math.random() * 0.25));
            this.attr.satisfactory = this.attr.satisfactory * 0.8
                    + satified * 0.2;
            return satified;
        } else {
            return 0;
        }
    },
    
    goShop: function(shopType) {
        var shops = gb.system.shops;
        if (shops.length < 1) {
            return;
        }
        var dest = shops[Math.floor(Math.random() * shops.length)];
        if (dest && dest.type === shopType) {
            this.path = gb.system.pathFinder.findPath(
                    gb.system.getRoadXy(this.s.x),
                    gb.system.getRoadXy(this.s.z),
                    dest.x, dest.y);
            this.dest = dest;
            this.state = this.STATE.GOING;
        }
    },
    
    goAmuse: function() {
        var amuse = gb.system.amusements;
        if (amuse.length < 1) {
            return;
        }
        var dest = amuse[Math.floor(Math.random() * amuse.length)];
        if (dest.inPos) {
            this.path = gb.system.pathFinder.findPath(
                    gb.system.getRoadXy(this.s.x),
                    gb.system.getRoadXy(this.s.z),
                    dest.inPos.x, dest.inPos.y);
            this.path.add(dest.entrance.x, dest.entrance.y);
            this.dest = dest;
            this.state = this.STATE.GOING;
        }
    },
    
    goWander: function() {
        var map = gb.system.graph.nodes;
        var cnt = 50; // try 50 times
        for (var i = 0; i < cnt; ++i) {
            var x = Math.floor(Math.random() * gb.xCnt);
            var y = Math.floor(Math.random() * gb.yCnt);
            if (map[x][y].type === gb.system.MAP_TYPES.ROAD) {
                this.path = gb.system.pathFinder.findPath(
                    gb.system.getRoadXy(this.s.x),
                    gb.system.getRoadXy(this.s.z), x, y);
                return;
            }
        }
    },
    
    goHome: function() {
        this.path = gb.system.pathFinder.findPath(
                gb.system.getRoadXy(this.s.x),
                gb.system.getRoadXy(this.s.z), 0, 12);
        this.state = this.STATE.EXIT;
    },
    
    computeWhereToGo: function() {
        if ((this.attr.satisfactory < 0.2 || this.attr.tiredness > 0.9
                || this.money < 10) && Math.random() > 0.1) {
            this.goHome();
        } else if (this.attr.hunger > this.findShopThreshold
                || Math.random() < 0.1) {
            this.goShop(Shop.prototype.TYPE.FOOD);
        } else if (this.attr.thirst > this.findShopThreshold
                || Math.random() < 0.1) {
            this.goShop(Shop.prototype.TYPE.DRINK);
        } else if (Math.random() > 0.25) {
            this.goAmuse();
        } else {
            this.goWander();
        }
    }
};
