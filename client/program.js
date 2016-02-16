var PausSwitch = function()
{
    var cbs = [];
    var paused = false;
    
    return {
        onToggle: function (cb)
        {
            cbs.push(cb);  
        },
        toggle: function()
        {
            paused = !paused;
            for (var i = 0; i < cbs.length; i++) cbs[i](paused);
        }
    }
};

var simulate = function(
    world,
    width, 
    height,
    clear,
    line,
    renderObj,
    renderText,
    pausSwitch)
{
    var ps = world.obj.ps;
    var vs = world.obj.vs;
    var as = world.obj.as;
    var cs = world.obj.cs;
    var ws = world.obj.ws;
    var groundPs = world.ground.groundPs;
    var groundCs = world.ground.groundCs;
    
    var updateModel = function(dt)
    {        
        setGravity(as, G);
        applyForces(dt, groundPs, groundCs, ps, vs, as, ws, cs, line);
        stepObj(dt, ps, vs, as);
        collide(groundPs, groundCs, ps, vs, as);
        world.applyNN();
    };
    
    var render = function()
    {
        clear();
        renderObj(ps, cs)
        renderObj(groundPs, groundCs);
        // var Energy = dist(vs[0])*dist(vs[0])/2 + (-G)*ps[0].y;
        // renderText(Energy + "", 10, 350);
    };
        
    mainloop(pausSwitch, updateModel, render, 100000);
};

var evaluate = function(world, iterations)
{    
    var ps = world.obj.ps;
    var vs = world.obj.vs;
    var as = world.obj.as;
    var cs = world.obj.cs;
    var ws = world.obj.ws;
    var groundPs = world.ground.groundPs;
    var groundCs = world.ground.groundCs;
    
    var updateModel = function(dt)
    {
        setGravity(as, G);
        world.applyNN();
        applyForces(dt, groundPs, groundCs, ps, vs, as, ws, cs);
        stepObj(dt, ps, vs, as);
        collide(groundPs, groundCs, ps, vs, as);
    };
        
    var iteration = 0;
    while (iteration++ <= iterations)
    {
        updateModel(10);
    }
};
