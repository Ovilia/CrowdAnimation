var gb = {
    width: null,
    height: null,
    menuHeight: 100,
    
    renderer: null,
    camera: null,
    scene: null,
    projector: null,
    raycaster: null,
    
    lookAt: new THREE.Vector3(0, 0, 0),
    
    mouse: {
        isPressed: false,
        state: 0,
        STATE: {
            NONE: 0,
            ADD_SHOP: 1,
            ADD_AMUS: 2,
            ADD_ROAD: 3
        },
        
        lastX: null,
        lastY: null,
        pressX: null,
        pressY: null,
        mouse2d: null,
        
        ray: {
            road: null,
            shop: null,
            amusement: null,
            agent: null
        },
        
        lastTheta: Math.PI / 4,
        lastPhi: Math.PI / 4,
        pressTheta: Math.PI / 4,
        pressPhi: Math.PI / 4,
        
        zoomRatio: 0.8,
        rotateRatio: 0.01,
        
        moveViewRadius: 20,
        moveViewSpeed: 0.005,
        moveViewFrames: 0,
        moveViewMaxFrames: 50,
        moveViewDragSpeed: 0.001
    },
    
    plane: {
        meshes: null,
        material: {
            grass: null,
            road: null,
            selectedLegal: null,
            selectedIllegal: null
        }
    },
    
    stats: null,
    
    xCnt: 25,
    yCnt: 25,
    system: null
    
};

$(document).ready(function() {
    resize();
    $(window).resize(resize);
    
    // in mouse.js
    mouseEvent();
    
    init();
    
    render();
});

function resize() {
    gb.width = $(window).innerWidth();
    gb.height = $(window).innerHeight();
    
    if (gb.renderer) {
        gb.camera.aspect = gb.width / gb.height;
        gb.camera.updateProjectionMatrix();
        
        gb.renderer.setSize(gb.width, gb.height);
    }
}

function init() {
    // renderer
    gb.renderer = new THREE.WebGLRenderer({
        canvas: $('#canvas')[0]
    });
    gb.renderer.setSize(gb.width, gb.height);
    
    // scene
    gb.scene = new THREE.Scene();
    
    // camera
    gb.camera = new THREE.PerspectiveCamera(45, gb.width / gb.height, 1, 1000);
    gb.camera.position.set(10, 10, 10);
    gb.camera.lookAt(new THREE.Vector3(0, 0, 0));
    gb.scene.add(gb.camera);
    
    // projector
    gb.projector = new THREE.Projector();
    
    // plane
    var texture = THREE.ImageUtils.loadTexture('image/grass.png');
    gb.plane.material.grass = new THREE.MeshLambertMaterial({
        map: texture
    });
    texture = THREE.ImageUtils.loadTexture('image/road.png');
    gb.plane.material.road = new THREE.MeshLambertMaterial({
        map: texture
    });
    gb.plane.material.selectedLegal = new THREE.MeshLambertMaterial({
        color: 0x6699ff
    });
    gb.plane.material.selectedIllegal = new THREE.MeshLambertMaterial({
        color: 0xff3366
    });
    gb.plane.meshes = new Array(gb.xCnt * gb.yCnt);
    for (var i = 0; i < gb.xCnt; ++i) {
        for (var j = 0; j < gb.yCnt; ++j) {
            var id = j * gb.xCnt + i;
            gb.plane.meshes[id] = new THREE.Mesh(
                    new THREE.PlaneGeometry(1, 1),
                    gb.plane.material.grass);
            gb.plane.meshes[id].rotation.x = -Math.PI / 2;
            gb.plane.meshes[id].position.set(
                    i - gb.xCnt / 2 + 0.5, 0, j - gb.yCnt / 2 + 0.5);
            gb.scene.add(gb.plane.meshes[id]);
        }
    }
    
    
    // light
    var light = new THREE.PointLight(0xcccccc);
    light.position.set(50, 100, 0);
    gb.scene.add(light);
    
    // system
    gb.system = new System();
    gb.system.init();
    
    // stat.js
    gb.stats = new Stats();
    gb.stats.domElement.style.position = 'absolute';
    gb.stats.domElement.style.left = '0px';
    gb.stats.domElement.style.top = '0px';
    document.body.appendChild(gb.stats.domElement);
}

function update() {
    // mouse.js
    checkMoveCamera();
    
    if (gb.mouse.mouse2d !== null && gb.mouse.state !== gb.mouse.STATE.NONE) {
        gb.raycaster = gb.projector.pickingRay(
                gb.mouse.mouse2d.clone(), gb.camera);
    }
    
    gb.system.update();
}

function render() {
    gb.stats.begin();
    
    update();
    gb.renderer.render(gb.scene, gb.camera);
    
    gb.stats.end();
    
    requestAnimationFrame(render);
}
