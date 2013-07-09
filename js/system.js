function System() {
    this.amusements = new Array();
    this.shops = new Array();
    this.agents = new Array();
    
    var cnt = gb.xCnt * gb.yCnt;
    this.map = new Array(cnt);
    for (var i = 0; i < cnt; ++i) {
        this.map[i] = this.MAP_TYPES.NONE;
    }
    
    this.pathFinder = new PathFinder(map);
    
    this.expectedAgentCnt = 0;
    this.agentCnt = 0;
}

System.prototype = {
    shopHeight: 1,
    shopPadding: 0.2,
    
    amusementHeightMin: 0.5,
    amusementHeightMax: 3,
    amusementPadding: 0.5,
    
    agentWidthMin: 0.15,
    agentWidthMax: 0.25,
    agentHeightMin: 0.2,
    agentHeightMax: 0.6,
    agentThickness: 0.1,
    groupMaxAgent: 6,
    agentMaxV: 0.02,
    agentMinV: 0.002,
    
    entrance: null,
    
    init: function() {
        this.expectedAgentCnt = 2;
        this.entrance = new THREE.Vector3(-gb.xCnt / 2, 0, 0);
        
        // original road
        for (var i = 0; i < 10; ++i) {
            var id = 12 * gb.xCnt + i;
            this.map[id] = this.MAP_TYPES.ROAD;
            gb.plane.meshes[id].material = gb.plane.material.road;
        }
    },
    
    update: function() {
        var that = this;
        
        addAgent();
        
        function addAgent() {
            // add new agent
            if (that.agentCnt < that.expectedAgentCnt && Math.random() > 0.99) {
                var cnt = Math.random() * that.groupMaxAgent;
                that.addAgents(cnt);
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
                this.map[i + j * gb.xCnt] = this.MAP_TYPES.AMUSEMENT;
            }
        }
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
        this.map[x + y * gb.xCnt] = this.MAP_TYPES.SHOP;
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
        return Math.floor(x + 0.5);
    },
    
    getRoadId: function(x, y) {
        return Math.floor(x + 0.5) + Math.floor(y + 0.5) * gb.yCnt;
    },
    
    MAP_TYPES: {
        NONE: 1,
        SHOP: 2,
        AMUSEMENT: 3,
        ROAD: 4
    }
};
