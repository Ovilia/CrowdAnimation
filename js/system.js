function System() {
    this.amusements = new Array();
    this.shops = new Array();
    this.agents = new Array();
    
    var cnt = gb.xCnt * gb.yCnt;
    this.map = new Array(cnt);
    for (var i = 0; i < cnt; ++i) {
        this.map[i] = this.MAP_TYPES.NONE;
    }
}

System.prototype = {
    shopHeight: 1,
    shopPadding: 0.2,
    
    amusementHeightMin: 0.5,
    amusementHeightMax: 5,
    amusementPadding: 0.5,
    
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
    
    MAP_TYPES: {
        NONE: 1,
        SHOP: 2,
        AMUSEMENT: 3,
        ROAD: 4
    }
};
