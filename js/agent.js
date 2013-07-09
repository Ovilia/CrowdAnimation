function Agent(x, y, z, mesh, maxV) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.mesh = mesh;
    
    this.maxV = maxV;
    
    this.state = this.STATE.EXPLORING;
    
    this.path = null;
}

Agent.prototype = {
    STATE: {
        GOING: 0,
        PLAYING: 1,
        EXPLORING: 2,
        WAITING: 3,
        LEAVING: 4
    },
    
    update: function() {
        if (this.path === null) {
            // compute path
            var shops = gb.system.shops;
            if (shops.length < 1) {
                return;
            }
            var dest = shops[Math.floor(Math.random() * shops.length)];
            this.path = gb.system.pathFinder.findPath(
                    gb.system.getRoadXy(this.x), gb.system.getRoadXy(z),
                    dest.x, dest.y);
        }
    }
};
