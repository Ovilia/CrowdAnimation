function mouseEvent() {
    var canvas = document.getElementById('canvas');
    canvas.onmousedown = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
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
            if (gb.mesh.adding === null) {
                console.log('add');
                gb.mesh.adding = new THREE.Mesh(THREE.PlaneGeometry(1, 1),
                        new THREE.MeshLambertMaterial({
                            color: 0xff9966
                        }));
                gb.scene.add(gb.mesh.adding);
            }
        }
        
        gb.mouse.lastX = e.clientX;
        gb.mouse.lastY = e.clientY;
    };
    
    canvas.onmouseup = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        gb.mouse.isPressed = false;
        gb.mouse.state = gb.mouse.STATE.NONE;
        
        gb.mouse.lastX = e.clientX;
        gb.mouse.lastY = e.clientY;
        console.log('up');
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

$('#addShopBtn').click(function() {
    console.log('click'); //TODO: WHY not work here
    gb.mouse.state = gb.mouse.STATE.ADD_SHOP;
});
