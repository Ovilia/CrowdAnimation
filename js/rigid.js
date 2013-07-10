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
    
    this.inPos = null;
    this.inMesh = null;
    this.entrance = null;
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
}



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
