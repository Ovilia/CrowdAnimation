function Agent(x, y, z, mesh, maxV) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.mesh = mesh;
    this.s = this.mesh.position;
    
    this.maxV = maxV;
    
    this.state = this.STATE.EXPLORING;
    
    this.path = null;
}

Agent.prototype = {
    STATE: {
        GOING: 0,
        USING: 1,
        EXPLORING: 2,
        WAITING: 3,
        LEAVING: 4
    },
    
    update: function() {
        if (this.state !== this.STATE.USING) {
            if (this.path === null) {
                // compute path
                var shops = gb.system.shops;
                if (shops.length < 1) {
                    return;
                }
                var dest = shops[Math.floor(Math.random() * shops.length)];
                this.path = gb.system.pathFinder.findPath(
                        gb.system.getRoadXy(this.s.x),
                        gb.system.getRoadXy(this.s.z),
                        dest.x, dest.y);
                this.state = this.STATE.GOING;
            } else {
                // going along the path
                var step = this.path.steps[this.path.current];
                if (step) {
                    if (step.x) {
                        var oldX = gb.system.getRoadXy(this.s.x);
                        this.s.x += this.maxV * Math.random();
                        var newX = gb.system.getRoadXy(this.s.x);
                        if (oldX != newX) {
                            // move to next step
                            ++this.path.current;
                            console.log('cross x');
                        }
                    } else {
                        var oldY = gb.system.getRoadXy(this.s.z);
                        this.s.z += this.maxV;
                        var newY = gb.system.getRoadXy(this.s.z);
                        if (oldY != newY) {
                            // move to next step
                            ++this.path.current;
                            console.log('cross z');
                        }
                    }
                } else {
                    // end of path
                    this.path = null;
                    this.state = this.STATE.USING;
                }
            }
        }
    }
};
