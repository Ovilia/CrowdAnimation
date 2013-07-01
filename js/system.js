function System() {
    this.amusements = new Array();
    this.shops = new Array();
    this.agents = new Array();
    
    this.shopHeight = 1;
    this.amusementHeightMin = 0.5;
    this.amusementHeightMax = 5;
}

System.prototype = {
    addAmusement: function(x1, y1, x2, y2) {
        var height = Math.random() * (this.amusementHeightMax
                - this.amusementHeightMin) + this.amusementHeightMin;
        
        var color = new THREE.Color();
        color.setHSL(Math.random(), 0.1, 0.5);
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(
                Math.abs(x2 - x1), height, Math.abs(y2 - y1)),
            new THREE.MeshLambertMaterial({
                color: color.getHex()
            }));
        mesh.position.set((x1 + x2) / 2, height / 2, (y1 + y2) / 2);
        gb.scene.add(mesh);
        
        this.amusements.push(new Amusement(x1, y1, x2, y2, height, mesh));
    },
    
    addShop: function(x, y) {
        var color = new THREE.Color();
        color.setHSL(Math.random(), 1.0, 0.5);
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(
                1, this.shopHeight, 1),
            new THREE.MeshLambertMaterial({
                color: color.getHex()
            }));
        mesh.position.set(x, this.shopHeight / 2, y);
        gb.scene.add(mesh);
        
        this.shops.push(new Shop(x, y, this.shopHeight, mesh));
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
    }
};
