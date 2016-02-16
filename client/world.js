var p = function(x, y)
{
    return {"x": x, "y": y};
};

var c = function(fromIx, toIx)
{
    return {"from": fromIx, "to": toIx, "len": null};
};

var w = function(fromIx, viaIx, toIx)
{
    return {"from": fromIx, "via": viaIx, "to": toIx, 
        "angle": null, "vel": 0, "acc": 0};
};

var initConnections = function(ps, cs, ws)
{
    for (var i = 0; i < cs.length; i++)
    {
        cs[i].len = dist(ps[cs[i].from], ps[cs[i].to]);
        cs[i]._len = cs[i].len;
    }
    
    for (var i = 0; i < ws.length; i++)
    {
        var v1 = sub(ps[ws[i].from], ps[ws[i].via]);
        var v2 = sub(ps[ws[i].to], ps[ws[i].via]);
        ws[i].angle = angle(v1, v2);
        ws[i]._angle = ws[i].angle;
    }
};

var iLinear = function(max, val)
{
    return 2*Math.min(max, Math.max(0, val))/max - 1;
}

var debug = 0;

var array = function(len, defaultObj)
{
    var ar = new Array(len);
    for (var i = 0; i < ar.length; i++)
    {
        ar[i] = defaultObj();
    }  
    return ar;
};

var defaultPs = null;
var defaultCs = null;
var defaultWs = null;

var copyArrayValues = function(list)
{
    var listCopy = new Array(list.length);
    for (var i = 0; i < list.length; i++)
    {
        listCopy[i] = list[i];
    }
    return listCopy;
};

var copyArray = function(list)
{
    var listCopy = new Array(list.length);
    for (var i = 0; i < list.length; i++)
    {
        listCopy[i] = $.extend({}, list[i]);
    }
    return listCopy;
};

var Ground = function(width)
{
    var GY = 30;
    return {
        "groundPs": [p(0, GY), p(width, GY)],
        "groundCs": [c(0, 1)]
    };
};

var makeWorld = function(width, height, ps, cs, ws)
{   
    ps = ps || copyArray(defaultPs);
    cs = cs || copyArray(defaultCs);
    ws = ws || copyArray(defaultWs);
    
    if (!defaultPs)
    {
        defaultPs = copyArray(ps);
        defaultCs = copyArray(cs);
        defaultWs = copyArray(ws);
    }
    
    var centerOfMass = function(ps)
    {
        var sum = p(0, 0);
        for (var i = 0; i < ps.length; i++)
        {
            addMe(sum, ps[i]);
        }
        return scale(sum, 1/ps.length);
    };
    
    var angularVelocity = function(c, ps, vs)
    {
       var sum = 0;
       for (var i = 0; i < vs.length; i++)
       {
           var dv = dist(vs[i]);
           if (dv > 0.1)
           sum += dist(vs[i]) * Math.sin( angle(vs[i],p(1, 0)) ) / dist(ps[i], c);
       } 
       return sum/ps.length;
    };
    
    var world = {obj:{}, ground:Ground(width)};    
    
    var L = 60;
    var V = 0;
    
    var H = 80;
    
    world.obj.ps = ps
    world.obj.vs = array(ps.length, function() { return p(0,0) });
    world.obj.as = array(ps.length, function() { return p(0,0) });
    world.obj.cs = cs;
    world.obj.ws = ws
    
    var startPositionToLeft = centerOfMass(ps).x < 300;
        
    initConnections(world.obj.ps, world.obj.cs, world.obj.ws);

    var muscleIxs = [];
    for (var i = 0; i < cs.length; i++)
    {
        if (cs[i].isMuscle)
            muscleIxs.push(i);
    }
    
    var numOutput = muscleIxs.length + ws.length;
    var net = Net(
        5*world.obj.ps.length + muscleIxs.length + ws.length + 3,
        Math.round(numOutput*1.5),
        numOutput
    );
    net.initialize();
    
    var energyF = function(p, v)
    {
        return Math.pow(dist(v), 2)/2 + -G*p.y;  
    };
    
    world.score = 0;
    world.net = net;
    world.applyNN = function(verbose)
    {
        var ps = world.obj.ps;
        var vs = world.obj.vs;
        var cs = world.obj.cs;
        var ws = world.obj.ws;
        
        var com = centerOfMass(ps);
        var angVel = angularVelocity(com, ps, vs);
        
        var input = [];
        
        
        // HARDCODED GROUND
        input = input.concat( ps.map(function(p) { return iLinear(100, p.y - world.ground.groundPs[0].y); }) );
        input = input.concat( ps.map(function(p) { return iLinear(1000, p.x); }) );

        input = input.concat( vs.map(function(p) { return iLinear(100, p.y); }) );
        input = input.concat( vs.map(function(p) { return iLinear(100, p.x); }) );

        // Kontakt!!!!!!!!!!!
        
        input = input.concat(ps.map(function(p, i) {
           if (p.y < 30.01)
           { 
                return iLinear(3000, -world.obj.as[i].y);
           }
           return -1;
        }));

        input = input.concat(
            muscleIxs.map(function(ix) { return iLinear(2*cs[ix]._len, cs[ix].len); })
        );
        
        input = input.concat(
            ws.map(function(wElem) { return iLinear(Math.PI*2, wElem.angle); })
        );
        
        input = input.concat([iLinear(100, com.y),iLinear(1000, com.x), iLinear(2, angVel)]);
        
        var output = net.eval(input);
        
        ws.forEach(function(wElem, index) 
        { 
            wElem.angle = wElem._angle + (Math.PI/2)*(output[index]-0.5); 
        });
        muscleIxs.forEach(function(mIx, index) 
        { 
            cs[mIx].len = cs[mIx]._len*(0.75 + (output[ws.length+index])/2); 
        });
        
        if (verbose)
        {
            console.log("input:");
            console.log(input);
            console.log("output:")
            console.log(output);
        }
        
        // var totHeight = ps.reduce(function(prev, curr) { return prev + curr.y - groundY; }, 0);
        // world.score += totHeight / ps.length;
    
        // WHOLE OBJECT
        // var sumV = vs.reduce(function(prev, curr) { return add(curr, prev); }, p(0,0)); 
        // var avgV = scale(sumV, 1/vs.length);
        // 
        // var kineticE = Math.pow(dist(avgV), 2)/2;
        // 
        // var potentialE = ps.reduce(function(prev, curr) {
        //     return prev + (-G)*curr.y; 
        //     }, 0)/ps.length;
                
        // PER VERTEX 
        var kineticE = vs.reduce(function(prev, curr) 
        { 
            return prev + Math.pow(dist(curr), 2)/2; 
        }, 
        0)/vs.length; 
        
        var potentialE = ps.reduce(function(prev, curr) 
        {
            return prev + (-G)*curr.y; 
        }, 
        0)/ps.length;
        
        if (startPositionToLeft)
        {
           world.score += (5*com.x*(-G) - kineticE) / 100000; 
        }
        else
        {
            var newScore = potentialE - 0*kineticE/10;
            world.score += newScore/10000;
        }
        
    };

    return world;  
};