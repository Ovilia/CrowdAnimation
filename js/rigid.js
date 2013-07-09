function Rigid(height, mesh) {
    this.height = height;
    this.mesh = mesh;
}

Rigid.prototype = {
    
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
}

Amusement.prototype = new Rigid();



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
