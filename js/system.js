function System() {
    this.amusements = new Array();
    this.shops = new Array();
    this.agents = new Array();
    
    // path search graph
    var graphArray = new Array(gb.xCnt);
    for (var i = 0; i < gb.xCnt; ++i) {
        graphArray[i] = new Array(gb.yCnt);
        for (var j = 0; j < gb.yCnt; ++j) {
            graphArray[i][j] = this.MAP_TYPES.NONE;
        }
    }
    this.graph = new Graph(graphArray);
    
    this.pathFinder = new PathFinder(this.graph);
    
    this.expectedAgentCnt = 0;
    this.agentCnt = 0;
    
    this.addAgentFrameMax = 500;
    this.addAgentFrame = this.addAgentFrameMax;
}

System.prototype = {
    shopHeight: 1,
    shopPadding: 0.2,
    
    amusementHeightMin: 1,
    amusementHeightMax: 3,
    amusementPadding: 0.5,
    
    agentWidthMin: 0.15,
    agentWidthMax: 0.25,
    agentHeightMin: 0.2,
    agentHeightMax: 0.6,
    agentThickness: 0.15,
    groupMaxAgent: 6,
    agentMaxV: 0.025,
    agentMinV: 0.005,
    
    stopSpeed: 0.0001,
    
    entrance: null,
    
    init: function() {
        this.entrance = new THREE.Vector3(-gb.xCnt / 2, 0, 0);
        
        // original road
        for (var i = 0; i < 10; ++i) {
            var id = 12 * gb.xCnt + i;
            this.graph.nodes[i][12].type = this.MAP_TYPES.ROAD;
            gb.plane.meshes[id].material = gb.plane.material.road;
        }
    },
    
    update: function() {
        var that = this;
        
        addAgent();
        
        // update agents
        this.updateAgent();
        
        // update shops and amusements
        for (var i = 0, len = this.shops.length; i < len; ++i) {
            if (this.shops[i]) {
                this.shops[i].update();
            }
        }
        for (var i = 0, len = this.amusements.length; i < len; ++i) {
            if (this.amusements[i]) {
                this.amusements[i].update();
            }
        }
        
        function addAgent() {
            // add new agent
            if (that.agentCnt < that.expectedAgentCnt) {
                ++that.addAgentFrame;
                if (that.addAgentFrame > that.addAgentFrameMax) {
                    if (Math.random() > 0.4) {
                        that.addAgents(1);
                    } else {
                        var cnt = Math.ceil(Math.random() * that.groupMaxAgent);
                        that.addAgents(cnt);
                    }
                    that.addAgentFrame = 0;
                }
            }
        }
    },
    
    addAmusement: function(x1, y1, x2, y2) {
        var height = Math.random() * (this.amusementHeightMax
                - this.amusementHeightMin) + this.amusementHeightMin;
        
        var color = new THREE.Color();
        color.setHSL(Math.random(), 1, 0.5);
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(
                Math.abs(x2 - x1) + 1 - this.amusementPadding,
                height, Math.abs(y2 - y1) + 1 - this.amusementPadding),
            new THREE.MeshLambertMaterial({
                color: color.getHex()
            }));
        mesh.position.set((x1 + x2) / 2 - Math.floor(gb.xCnt / 2), height / 2,
                (y1 + y2) / 2 - Math.floor(gb.yCnt / 2));
        gb.scene.add(mesh);
        
        this.amusements.push(new Amusement(x1, y1, x2, y2, height, mesh));
        
        // update map
        var minX = Math.min(x1, x2);
        var maxX = Math.max(x1, x2);
        var minY = Math.min(y1, y2);
        var maxY = Math.max(y1, y2);
        for (var i = minX; i <= maxX; ++i) {
            for (var j = minY; j <= maxY; ++j) {
                this.graph.nodes[i][j].type = this.MAP_TYPES.AMUSEMENT;
            }
        }
    },
    
    // set in position of last amusement
    setAmuseIn: function(x, y) {
        var len = this.amusements.length;
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(1, 0.1, 1),
                this.amusements[len - 1].mesh.material);
        mesh.position.set(x - Math.floor(gb.xCnt / 2), 1,
                y - Math.floor(gb.yCnt / 2));
        gb.scene.add(mesh);
        
        this.amusements[len - 1].setIn(x, y, mesh);
        this.graph.nodes[x][y].type = this.MAP_TYPES.AMUSE_IN;
    },
    
    isLegalAmuseIn: function(x, y) {
        if (this.amusements.length === 0) {
            return false;
        }
        var amuse = this.amusements[this.amusements.length - 1];
        if (amuse !== undefined && (((x === amuse.x1 - 1 || x === amuse.x2 + 1)
                && (y >= amuse.y1 && y <= amuse.y2))
                || ((y === amuse.y1 - 1 || y === amuse.y2 + 1)
                && (x >= amuse.x1 && x <= amuse.x2)))) {
            return true;
        }
        return false;
    },
    
    addShop: function(x, y) {
        var color = new THREE.Color();
        color.setHSL(Math.random(), 0.75, 0.5);
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(
                1 - this.shopPadding, this.shopHeight, 1 - this.shopPadding),
            new THREE.MeshLambertMaterial({
                color: color.getHex()
            }));
        mesh.position.set(x - Math.floor(gb.xCnt / 2), this.shopHeight / 2,
                y - Math.floor(gb.yCnt / 2));
        gb.scene.add(mesh);
        
        this.shops.push(new Shop(x, y, this.shopHeight, mesh));
        
        // update map
        this.graph.nodes[x][y].type = this.MAP_TYPES.SHOP;
    },
    
    // add a group of agents
    addAgents: function(cnt) {
        var color = new THREE.Color();
        color.setHSL(Math.random(), 1, 0.5);
        for (var i = 0; i < cnt; ++i) {
            var z = Math.random() * (this.agentWidthMax - this.agentWidthMin)
                    + this.agentWidthMin;
            var y = Math.random() * (this.agentHeightMax - this.agentHeightMin)
                    + this.agentHeightMin;
            var x = this.agentThickness;
            var mesh = new THREE.Mesh(new THREE.CubeGeometry(x, y, z),
                new THREE.MeshLambertMaterial({
                    color: color.getHex()
                }));
            mesh.position.set(this.entrance.x, this.entrance.y + y / 2,
                    this.entrance.z);
            gb.scene.add(mesh);
            
            var v = Math.random() * (this.agentMaxV - this.agentMinV)
                    + this.agentMinV;
            this.agents.push(new Agent(x, y, z, mesh, v));
        }
        this.agentCnt += cnt;
    },
    
    removeAgent: function(agent) {
        for (var i = 0, len = this.agents.length; i < len; ++i) {
            if (this.agents[i] && this.agents[i] === agent) {
                gb.scene.remove(this.agents[i].mesh);
                delete this.agents[i];
                --this.agentCnt;
                return;
            }
        }
    },
    
    clear: function() {
        var len = this.amusements.length;
        for (var i = 0; i < len; ++i) {
            if (this.amusements[i]) {
                gb.scene.remove(this.amusements[i].mesh);
                this.amusements[i] = null;
            }
        }
        this.amusements = new Array();
        
        len = this.shops.length;
        for (var i = 0; i < len; ++i) {
            if (this.shops[i]) {
                gb.scene.remove(this.shops[i].mesh);
                this.shops[i] = null;
            }
        }
        this.shops = new Array();
        
        this.agents = new Array();
    },
    
    getRoadXy: function(x) {
        return Math.floor(x + 12.5);
    },
    
    getRoadId: function(x, y) {
        return Math.floor(x + 12.5) + Math.floor(y + 12.5) * gb.yCnt;
    },
    
    getRoadPos: function(x) {
        return x - 12;
    },
    
    updateAgent: function() {
        // update v and stride
        for (var i = 0, len = this.agents.length; i < len; ++i) {
            if (this.agents[i]) {
                this.agents[i].updateV();
            }
        }
        
        // check stride
        for (var i = 0, len = this.agents.length; i < len; ++i) {
            if (this.agents[i] && this.agents[i].path) {
                var a = this.agents[i];
                var aStep = a.path.steps[a.path.current];
                if (!aStep) {
                    continue;
                }
                
                for (var j = i + 1, len = this.agents.length; j < len; ++j) {
                    var b = this.agents[j];
                    if (!b || !b.path || !b.path.steps[b.path.current]) {
                        continue;
                    }
                    // check if stride collide
                    var decreaseI =
                            a.distanceToNextStep() > b.distanceToNextStep();
                    while (strideCollide(a.stride, b.stride)
                            && (a.v.modulus() > this.stopSpeed
                            || b.v.modulus() > this.stopSpeed)) {
                        if (decreaseI) {
                            a.v.x = a.v.x < this.stopSpeed ? 0 : a.v.x * 0.8;
                            a.v.y = a.v.y < this.stopSpeed ? 0 : a.v.y * 0.8;
                            a.v = a.v.rotate(Math.PI / 3);
                            a.updateStride(a.v.x, a.v.y);
                        } else {
                            b.v.x = b.v.x < this.stopSpeed ? 0 : b.v.x * 0.8;
                            b.v.y = b.v.y < this.stopSpeed ? 0 : b.v.y * 0.8;
                            b.v = b.v.rotate(Math.PI / 3);
                            b.updateStride(b.v.x, b.v.y);
                        }
                        decreaseI = !decreaseI;
                    }
                }
            }
        }
        
        
        // update s
        for (var i = 0, len = this.agents.length; i < len; ++i) {
            if (this.agents[i] && this.agents[i].path) {
                var a = this.agents[i];
                var step = a.path.steps[a.path.current];
                
                // rotate agent
                var alpha = (a.v.x === 0) ? Math.PI / 2
                        : Math.atan(a.v.y / a.v.x);
                a.mesh.rotation.y = alpha;
                
                // update s
                a.s.x += a.v.x;
                a.s.z += a.v.y;
                a.strideMesh.position.x = a.s.x + (a.stride.length - a.x) / 2;
                a.strideMesh.position.z = a.s.z;
                
                // check step
                if ((step.x > 0 && a.s.x >= step.absX - 12) ||
                        (step.x < 0 && a.s.x <= step.absX - 12) ||
                        (step.y > 0 && a.s.z >= step.absY - 12) ||
                        (step.y < 0 && a.s.z <= step.absY - 12)) {
                    // move to next step
                    ++a.path.current;
                    a.attr.tiredness += Math.random() * 0.005;
                    a.attr.hunger += Math.random() * 0.005;
                    a.attr.thirst += Math.random() * 0.005;
                }
            }
        }
        
        function strideCollide(aStride, bStride) {
        
            // check collision with one vector and (4 * 2) points
            // a and b are arrays of 4 vectors each
            function check(vec, a, b) {
                // min and max projection onto vec
                function minMaxProjection(vec, arr) {
                    var ans = {
                        minX: Infinity,
                        maxX: -Infinity,
                        minY: Infinity,
                        maxY: -Infinity
                    };
                    for (var i = 0; i < 4; ++i) {
                        var pro = vec.project(arr[i]);
                        if (!pro) {
                            continue;
                        }
                        if (pro.x > ans.maxX) ans.maxX = pro.x;
                        if (pro.x < ans.minX) ans.minX = pro.x;
                        if (pro.y > ans.maxY) ans.maxY = pro.y;
                        if (pro.y < ans.minY) ans.minY = pro.y;
                    }
                    return ans;
                }
                
                var aMinMax = minMaxProjection(vec, a);
                var bMinMax = minMaxProjection(vec, b);
                var threshold = 0.0001;
                if (bMinMax.minX - aMinMax.maxX > threshold
                        || bMinMax.minY - aMinMax.maxY > threshold
                        || aMinMax.minX - bMinMax.maxX > threshold
                        || aMinMax.minY - bMinMax.maxY > threshold) {
                    // no collision
                    return false;
                } else {
                    return true;
                }
            }
            
            var vec = [aStride.points[0].minus(aStride.points[1]),
                    aStride.points[0].minus(aStride.points[2]),
                    bStride.points[0].minus(bStride.points[1]),
                    bStride.points[0].minus(bStride.points[2])];
            for (var i = 0; i < 4; ++i) {
                if (check(vec[i], aStride.points, bStride.points) === false) {
                    return false;
                }
            }
            return true;
        }
    },
    
    MAP_TYPES: {
        NONE: 0,
        
        ROAD: 1, // open for path finder
        
        SHOP: 2,
        
        AMUSEMENT: 3,
        AMUSE_IN: 3.1 // also open
    }
};
