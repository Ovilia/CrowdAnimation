function Vec2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

Vec2.prototype = {
    add: function(vec, y) {
        if (y !== undefined) {
            // use vec as x
            return new Vec2(this.x + vec, this.y + y);
        }
        return new Vec2(this.x + vec.x, this.y + vec.y);
    },
    
    minus: function(vec, y) {
        if (y !== undefined) {
            // use vec as x
            return new Vec2(this.x + vec, this.y + y);
        }
        return new Vec2(this.x - vec.x, this.y - vec.y);
    },
    
    scale: function(s) {
        return new Vec2(this.x * s, this.y * s);
    },
    
    dotProduct: function(vec) {
        return this.x * vec.x + this.y * vec.y;
    },
    
    modulus: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },
    
    normalize: function() {
        var m = this.modulus();
        if (m === 0) {
            return new Vec2(0, 0);
        }
        return new Vec2(this.x / m, this.y / m);
    },
    
    // CCW for positive alpha
    rotate: function(alpha) {
        var sin = Math.sin(alpha);
        var cos = Math.cos(alpha);
        return new Vec2(this.x * cos + this.y * sin,
                -this.x * sin + this.y * cos);
    },
    
    // projection of the other vector on this vector
    project: function(vec) {
        if (vec.x === 0 && vec.y === 0) {
            return null;
        }
        return this.scale(this.dotProduct(vec) / this.modulus());
    }
};
