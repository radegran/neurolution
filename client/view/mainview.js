var MainView = function($container) {

    var width = $container.width();
    var height = $container.height();
    var viewAngle = 45;
    var aspectRatio = width / height;
    var near = 0.1;
    var far = 10000;

    var renderer = new THREE.WebGLRenderer();
    var camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far);
    var scene = new THREE.Scene();

    scene.add(camera);

    camera.position.z = 300;

    renderer.setSize(width, height);

    $container.append(renderer.domElement);

    // set up the sphere vars
    var radius = 50,
        segments = 16,
        rings = 16;

    var sphereMaterial =
      new THREE.MeshLambertMaterial(
        {
          color: 0xCC0000
        });

    // create a new mesh with
    // sphere geometry - we will cover
    // the sphereMaterial next!
    var sphere = new THREE.Mesh(

      new THREE.SphereGeometry(
        radius,
        segments,
        rings),

      sphereMaterial);

    // add the sphere to the scene
    scene.add(sphere);



    // create a point light
var pointLight =
  new THREE.PointLight(0xFFFFFF);

// set its position
pointLight.position.x = 10;
pointLight.position.y = 50;
pointLight.position.z = 130;

// add to the scene
scene.add(pointLight);



renderer.render(scene, camera);
};

