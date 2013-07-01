var gb = {
    width: null,
    height: null,
    menuHeight: 100,
    
    renderer: null,
    camera: null,
    scene: null,
    projector: null,
    
    lookAt: new THREE.Vector3(0, 0, 0),
    
    mouse: {
        isPressed: false,
        state: 0,
        STATE: {
            NONE: 0,
            ADD_SHOP: 1,
            ADD_AMUS:2
        },
        
        lastX: null,
        lastY: null,
        pressX: null,
        pressY: null,
        
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
    
    mesh: {
        plane: null,
        adding: null
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
    
    
    // plane
    gb.mesh.plane = new THREE.Mesh(
            new THREE.PlaneGeometry(gb.xCnt, gb.yCnt),
            new THREE.MeshLambertMaterial({
                color: 0x336600
            }));
    gb.mesh.plane.rotation.x = -Math.PI / 2;
    gb.scene.add(gb.mesh.plane);
    
    // light
    var light = new THREE.PointLight(0xcccccc);
    light.position.set(50, 100, 0);
    gb.scene.add(light);
    
    // system
    gb.system = new System();
    
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
}

function render() {
    gb.stats.begin();
    
    update();
    gb.renderer.render(gb.scene, gb.camera);
    
    gb.stats.end();
    
    requestAnimationFrame(render);
}
