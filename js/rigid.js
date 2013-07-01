function Rigid(x1, y1, x2, y2, height, mesh) {
    
}

Rigid.prototype = {
    
};



function Amusement(x1, y1, x2, y2, height, mesh) {
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
}

Shop.prototype = new Rigid();
