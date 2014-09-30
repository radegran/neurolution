var View = {

    'createScene': function(camera) {

        var scene = new THREE.Scene();
        scene.add(camera);
        return scene;
        
    },

    'createCamera': function(viewport) {

        var viewAngle = 45;
        var aspectRatio = viewport.width() / viewport.height();
        var near = 0.1;
        var far = 10000;
        var camera = new THREE.PerspectiveCamera(viewAngle, aspectRatio, near, far);
        camera.position.z = 300;

        return camera;

    },

    'createRenderer': function(viewport) {

        var renderer = new THREE.WebGLRenderer();
        viewport.appendRenderer(renderer);
        renderer.setSize(viewport.width(), viewport.height());

        return renderer;

    },

    'Viewport': function($elem) {

        return  {

            'width': function() { return $elem.width(); },
            'height': function() { return $elem.height(); },
            'appendRenderer': function(renderer) { $elem.append(renderer.domElement); }

        };

    },

    'renderFunc': function(options) {

        var renderer = options.renderer;
        var scene = options.scene;
        var camera = options.camera;

        return function() {

            renderer.render(scene, camera);

        };

    },

    'World': function(scene) {

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

    }
};

