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
                        this.s.x += this.maxV * step.x;
                        if (Math.abs(this.s.x - step.absX + 12) < 0.01) {
                            // move to next step
                            ++this.path.current;
                            console.log('x')
                        }
                    } else {
                        this.s.z += this.maxV * step.y;
                        if (Math.abs(this.s.z - step.absY + 12) < 0.01) {
                            // move to next step
                            ++this.path.current;
                            console.log('y')
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
