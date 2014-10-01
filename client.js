$(document).ready(function() {
    
    var viewport = View.Viewport($('#main'));
    var camera = View.createCamera(viewport);
    var scene = View.createScene(camera);
    var client = Client(io());

    Console.attach(
        Console.create($('#console')),
        client,
        {
            'camera': camera,
            'mainloop': Core.Loop(
                View.renderFunc({
                    'renderer': View.createRenderer(viewport),
                    'scene': scene,
                    'camera': camera
                })),
            'world': View.World(scene),
            'server': Commands.getDictionary(client)
        }
    );

});
