var gb = {
    width: null,
    height: null,
    
    renderer: null,
    camera: null,
    scene: null
    
};

$(document).ready(function() {
    resize();
    $(window).resize(resize);
    
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
    gb.camera.position.set(50, 50, 50);
    gb.camera.lookAt(new THREE.Vector3(0, 0, 0));
    gb.scene.add(gb.camera);
    
    // plane
    var plane = new THREE.Mesh(
            new THREE.PlaneGeometry(100, 100),
            new THREE.MeshLambertMaterial({
                color: 0x66ff00,
            }));
    plane.rotation.x = -Math.PI / 2;
    gb.scene.add(plane);
    
    // light
    var light = new THREE.PointLight(0xcccccc);
    light.position.set(200, 500, 0);
    gb.scene.add(light);
}

function render() {
    gb.renderer.render(gb.scene, gb.camera);
    
    requestAnimationFrame(render);
}
