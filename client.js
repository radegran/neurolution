$(document).ready(function() {
    
    var viewport = View.Viewport($('#main'));
    var camera = View.createCamera(viewport);
    var scene = View.createScene(camera);

    Console.attach(
        Console.create($('#console')),
        Client(io()),
        {
            'camera': camera,
            'mainloop': Core.Loop(
                View.renderFunc({
                    'renderer': View.createRenderer(viewport),
                    'scene': scene,
                    'camera': camera
                })),
            'world': View.World(scene)
        }
    );

});
