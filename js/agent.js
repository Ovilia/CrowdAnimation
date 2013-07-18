function Agent(x, y, z, mesh, maxV) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.mesh = mesh;
    this.s = this.mesh.position;
    
    this.maxV = maxV;
    this.v = new Vec2();
    this.stride = null;
    this.strideMesh = new THREE.Mesh(new THREE.CubeGeometry(x, y, z),
            new THREE.MeshLambertMaterial({
                color: 0xff0000,
                wireframe: true
            })
    );
    this.strideMesh.position.set(this.s.x, this.s.y, this.s.z);
    this.strideSave = false;
    //gb.scene.add(this.strideMesh);
    
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
    
    MAX_STRIDE: 0.5,
    
    STRIDE_RATIO: 100,
    
    updateV: function() {
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
                var dest = new Vec2(gb.system.getRoadPos(step.absX),
                        gb.system.getRoadPos(step.absY));
                var cur = new Vec2(this.s.x, this.s.z);
                this.v = dest.minus(cur).normalize().scale(this.maxV);
                
                this.strideSave = false;
                this.updateStride(this.v.x, this.v.y);
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
    
    updateStride: function(vx, vy) {
        var length = Math.sqrt(vx * vx + vy * vy) * this.STRIDE_RATIO;
        var alpha = 0;
        if (vy === 0) {
            if (vx > 0) {
                alpha = Math.PI / 2;
            } else {
                alpha = -Math.PI / 2;
            }
        } else {
            alpha = Math.atan(vx / vy);
        }
        
        this.stride = {
            length: length,
            points: [new Vec2(this.x / 2, -this.z / 2)
                            .rotate(alpha).add(this.s.x, this.s.z),
                    new Vec2(-this.x / 2, -this.z / 2)
                            .rotate(alpha).add(this.s.x, this.s.z),
                    new Vec2(this.x / 2, -this.z / 2 + length)
                        .rotate(alpha).add(this.s.x, this.s.z),
                    new Vec2(-this.x / 2, -this.z / 2 + length)
                        .rotate(alpha).add(this.s.x, this.s.z)]
        };
        this.strideMesh.scale.x = (length + this.x) / this.x;
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
                    + (rigidAttr.excitement + Math.random()) * 0.05, 1);
            this.attr.thirst = Math.min(this.attr.thirst
                    + (rigidAttr.excitement + Math.random()) * 0.05, 1);
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
            this.attr.hunger = Math.min(1, Math.max(0, this.attr.hunger
                    + rigidAttr.hunger));
            this.attr.thirst = Math.min(1, Math.max(0, this.attr.thirst
                    + rigidAttr.thirst));
            this.attr.tiredness = Math.min(1, Math.max(0, this.attr.tiredness
                    + rigidAttr.tiredness));
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
                || Math.random() < 0.05) {
            this.goShop(Shop.prototype.TYPE.FOOD);
        } else if (this.attr.thirst > this.findShopThreshold
                || Math.random() < 0.05) {
            this.goShop(Shop.prototype.TYPE.DRINK);
        } else if (Math.random() > 0.25) {
            this.goAmuse();
        } else {
            this.goWander();
        }
    },
    
    distanceToNextStep: function() {
        if (this.path && this.path.steps[this.path.current]) {
            var step = this.path.steps[this.path.current];
            var des = new Vec2(step.absX, step.absY);
            var cur = new Vec2(this.s.x, this.s.z);
            return des.minus(cur).modulus();
        } else {
            return Infinity;
        }
    }
};
