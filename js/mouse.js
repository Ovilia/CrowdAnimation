function mouseEvent() {
    var canvas = document.getElementById('canvas');
    canvas.onmousedown = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (gb.mouse.state === gb.mouse.STATE.ADD_ROAD) {
            var intersects = gb.raycaster.intersectObjects(gb.plane.meshes);
            if (intersects.length > 0) {
                var point = intersects[0].point;
                var x = Math.floor(point.x + gb.xCnt / 2);
                var y = Math.floor(point.z + gb.yCnt / 2);
                if (gb.system.graph.nodes[x][y].type
                            === gb.system.MAP_TYPES.NONE) {
                    gb.plane.meshes[x + y * gb.xCnt].material
                            = gb.plane.material.road;
                    gb.system.graph.nodes[x][y].type = gb.system.MAP_TYPES.ROAD;
                }
            }
        }
        
        gb.mouse.isPressed = true;
        
        gb.mouse.pressX = e.clientX;
        gb.mouse.pressY = e.clientY;
        
        gb.mouse.lastX = e.clientX;
        gb.mouse.lastY = e.clientY;
        
        gb.mouse.pressTheta = gb.mouse.lastTheta;
        gb.mouse.pressPhi = gb.mouse.lastPhi;
    };
    
    canvas.onmousemove = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        if (gb.mouse.isPressed) {
            if (e.which === 1) {
                // left mouse
                if (gb.mouse.state === gb.mouse.STATE.ADD_AMUS) {
                    // select area
                    var intersects = gb.raycaster.intersectObjects(
                            gb.plane.meshes);
                    if (intersects.length > 0) {
                        // set the selected id
                        var point = intersects[0].point;
                        gb.mouse.ray.road.end = {
                            x: Math.floor(point.x + gb.xCnt / 2 + 0.5),
                            y: Math.floor(point.z + gb.yCnt / 2 + 0.5)
                        };
                        
                        // set material
                        var minX = Math.min(gb.mouse.ray.road.start.x,
                                gb.mouse.ray.road.end.x);
                        var maxX = Math.max(gb.mouse.ray.road.start.x,
                                gb.mouse.ray.road.end.x);
                        var minY = Math.min(gb.mouse.ray.road.start.y,
                                gb.mouse.ray.road.end.y);
                        var maxY = Math.max(gb.mouse.ray.road.start.y,
                                gb.mouse.ray.road.end.y);
                        gb.mouse.ray.road.start.isLegal = true;
                        for (var i = 0; i < gb.xCnt; ++i) {
                            for (var j = 0; j < gb.yCnt; ++j) {
                                var id = i + j * gb.xCnt;
                                if (i >= minX && i <= maxX
                                        && j >= minY && j <= maxY) {
                                    
                                    if (gb.system.graph.nodes[i][j].type ===
                                            gb.system.MAP_TYPES.NONE) {
                                        gb.plane.meshes[id].material
                                            = gb.plane.material.selectedLegal;
                                    } else {
                                        gb.plane.meshes[id].material
                                            = gb.plane.material.selectedIllegal;
                                        gb.mouse.ray.road.start.isLegal = false;
                                    }
                                } else {
                                    if (gb.system.graph.nodes[i][j].type ===
                                            gb.system.MAP_TYPES.ROAD) {
                                        gb.plane.meshes[id].material
                                            = gb.plane.material.road;
                                    } else {
                                        gb.plane.meshes[id].material
                                            = gb.plane.material.grass;
                                    }
                                }
                            }
                        }
                    }
                } else if (gb.mouse.state === gb.mouse.STATE.ADD_ROAD) {
                    var intersects = gb.raycaster.intersectObjects(
                            gb.plane.meshes);
                    if (intersects.length > 0) {
                        var point = intersects[0].point;
                        var x = Math.floor(point.x + gb.xCnt / 2);
                        var y = Math.floor(point.z + gb.yCnt / 2);
                        if (gb.system.graph.nodes[x][y].type
                                === gb.system.MAP_TYPES.NONE) {
                            gb.plane.meshes[x + y * gb.xCnt].material
                                    = gb.plane.material.road;
                            gb.system.graph.nodes[x][y].type
                                    = gb.system.MAP_TYPES.ROAD;
                        }
                    }
                }
                
            } else if (e.which === 2) {
                // middle mouse
                // rotate on xOz plane, by mouse x change
                var theta = -(e.clientX - gb.mouse.pressX)
                        * gb.mouse.rotateRatio + gb.mouse.pressTheta;
                var phi = (event.clientY - gb.mouse.pressY)
                        * gb.mouse.rotateRatio + gb.mouse.pressPhi;
                phi = Math.min(Math.PI, Math.max(Math.PI / 12, phi));
                
                var x = gb.camera.position.x - gb.lookAt.x;
                var y = gb.camera.position.y - gb.lookAt.y;
                var z = gb.camera.position.z - gb.lookAt.z;                
                var r = Math.sqrt(x * x + y * y + z * z);
                
                gb.camera.position.set(r * Math.sin(theta) * Math.cos(phi)
                        + gb.lookAt.x,
                        r * Math.sin(phi) + gb.lookAt.y,
                        r * Math.cos(theta) * Math.cos(phi) + gb.lookAt.z);
                gb.camera.lookAt(gb.lookAt);
                
                gb.mouse.lastTheta = theta;
                gb.mouse.lastPhi = phi;
                
            } else if (e.which === 3) {
                // right mouse
                // move camera
                moveCamera(true, -(e.clientX - gb.mouse.lastX)
                        * gb.mouse.moveViewDragSpeed);
            }
            
        } else if (gb.mouse.state !== gb.mouse.STATE.NONE) {
            // adding something
            var intersects = gb.raycaster.intersectObjects(gb.plane.meshes);
            if (intersects.length > 0) {
                // set the selected id
                var point = intersects[0].point;
                gb.mouse.ray.road = {
                    start: {
                        x: Math.floor(point.x + gb.xCnt / 2),
                        y: Math.floor(point.z + gb.yCnt / 2)
                    },
                    end: {
                        x: Math.floor(point.x + gb.xCnt / 2),
                        y: Math.floor(point.z + gb.yCnt / 2)
                    }
                };
                
                // set material
                for (var i = 0; i < gb.xCnt; ++i) {
                    for (var j = 0; j < gb.yCnt; ++j) {
                        var id = i + j * gb.xCnt;
                        if (intersects[0].object === gb.plane.meshes[id]) {
                            if (gb.system.graph.nodes[i][j].type
                                        === gb.system.MAP_TYPES.NONE) {
                                intersects[0].object.material
                                        = gb.plane.material.selectedLegal;
                                gb.mouse.ray.road.start.isLegal = true;
                            } else {
                                intersects[0].object.material
                                        = gb.plane.material.selectedIllegal;
                                gb.mouse.ray.road.start.isLegal = false;
                            }
                        } else {
                            if (gb.system.graph.nodes[i][j].type
                                        === gb.system.MAP_TYPES.ROAD) {
                                gb.plane.meshes[id].material
                                        = gb.plane.material.road;
                            } else {
                                gb.plane.meshes[id].material
                                        = gb.plane.material.grass;
                            }
                        }
                    }
                }
            }
        }
        
        gb.mouse.lastX = e.clientX;
        gb.mouse.lastY = e.clientY;
        gb.mouse.mouse2d = new THREE.Vector3(e.clientX / gb.width * 2 - 1,
                    -e.clientY / gb.height * 2 + 1, 0.5);
    };
    
    canvas.onmouseup = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        gb.mouse.isPressed = false;
        
        if (e.which === 1) {
            if (gb.mouse.state !== gb.mouse.STATE.NONE
                    && gb.mouse.ray.road.start.isLegal) {
                if (gb.mouse.state === gb.mouse.STATE.ADD_SHOP) {
                    // add shop
                    gb.system.addShop(gb.mouse.ray.road.start.x,
                            gb.mouse.ray.road.start.y);
                } else if (gb.mouse.state === gb.mouse.STATE.ADD_AMUS) {
                    // add amusement
                    gb.system.addAmusement(gb.mouse.ray.road.start.x,
                            gb.mouse.ray.road.start.y, gb.mouse.ray.road.end.x,
                            gb.mouse.ray.road.end.y);
                }
                for (var i = 0; i < gb.xCnt; ++i) {
                    for (var j = 0; j < gb.yCnt; ++j) {
                        var id = j * gb.xCnt + i;
                        if (gb.system.graph.nodes[i][j].type
                                    === gb.system.MAP_TYPES.ROAD) {
                            gb.plane.meshes[id].material
                                    = gb.plane.material.road;
                        } else {
                            gb.plane.meshes[id].material
                                    = gb.plane.material.grass;
                        }
                    }
                }
                
                gb.mouse.state = gb.mouse.STATE.NONE;
                gb.mouse.ray.road = null;
            }
        }
        
        gb.mouse.lastX = e.clientX;
        gb.mouse.lastY = e.clientY;
    };
    
    canvas.oncontextmenu = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }
    
    $('canvas').bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta > 0) {
            gb.camera.position.sub(gb.lookAt)
                    .multiplyScalar(gb.mouse.zoomRatio).add(gb.lookAt);
        } else{
            gb.camera.position.sub(gb.lookAt)
                    .multiplyScalar(1 / gb.mouse.zoomRatio).add(gb.lookAt);
        }
    });
    
    canvas.addEventListener('mouseout', function() {
        gb.mouse.lastX = gb.mouse.lastY
                = gb.mouse.pressX = gb.mouse.pressY = null;
    }, false);
    
    $('#addShopBtn').click(function() {
        gb.mouse.state = gb.mouse.STATE.ADD_SHOP;
    });
    
    $('#addAmusBtn').click(function() {
        gb.mouse.state = gb.mouse.STATE.ADD_AMUS;
    });
    
    $('#addRoadBtn').click(function() {
        gb.mouse.state = gb.mouse.STATE.ADD_ROAD;
    })

    $('#addAgentsBtn').click(function() {
        //gb.system.expectedAgentCnt += 5;
        gb.system.addAgents(1);
    })
}

function checkMoveCamera() {
    var left = gb.mouse.lastX < gb.mouse.moveViewRadius;
    var right = gb.mouse.lastX > gb.width - gb.mouse.moveViewRadius;
    if (gb.mouse.lastX !== null && (left || right)) {
        gb.mouse.moveViewFrames += 1;
        if (gb.mouse.moveViewFrames >= gb.mouse.moveViewMaxFrames) {
            if (left) {
                // move camera left
                moveCamera(true, -gb.mouse.moveViewSpeed);
            } else if (right) {
                // move camera right
                moveCamera(true, gb.mouse.moveViewSpeed);
            }   
        }
    }
    
    var up = gb.mouse.lastY < gb.mouse.moveViewRadius;
    var down = gb.mouse.lastY > gb.height - gb.menuHeight
            - gb.mouse.moveViewRadius
            && gb.mouse.lastY < gb.height - gb.menuHeight;
    if (gb.mouse.lastY !== null && (up || down)) {
        gb.mouse.moveViewFrames += 1;
        if (gb.mouse.moveViewFrames > gb.mouse.moveViewMaxFrames) {
            if (up) {
                // move camera up
                moveCamera(false, -gb.mouse.moveViewSpeed);
            } else if (down) {
                // move camera down
                moveCamera(false, gb.mouse.moveViewSpeed);
            }
        }
    }
    
    if (!left && !right && !up && !down) {
        gb.mouse.moveViewFrames = 0;
    }
}

function moveCamera(isHorizontal, distance) {
    var x = gb.camera.position.x - gb.lookAt.x;
    var y = gb.camera.position.y - gb.lookAt.y;
    var z = gb.camera.position.z - gb.lookAt.z;
    var r = Math.sqrt(x * x + y * y + z * z);
    
    if (isHorizontal) {
        gb.camera.position.x += z * distance;
        gb.camera.position.z -= x * distance;
        gb.lookAt.x += z * distance;
        gb.lookAt.z -= x * distance;
    } else {
        gb.camera.position.x += x * distance;
        gb.camera.position.z += z * distance;
        gb.lookAt.x += x * distance;
        gb.lookAt.z += z * distance;
    }
    gb.camera.lookAt(gb.lookAt);
}
