
var mainloop = function(pausSwitch, callbackUpdate, callbackRender, iterations)
{
    var now = Date.now();
    var remaining = 0;
    var iteration = 0;
    
    var modelStepTime = 10;
    
    var animFrame = window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            window.oRequestAnimationFrame      ||
            window.msRequestAnimationFrame     ||
            null ;

    var exit = false;
    var recursiveAnim = function() 
    {
        var t = Date.now();
        remaining += (t-now);
        now = t;
    
        while (remaining > modelStepTime)
        {
            callbackUpdate(modelStepTime);
            if (iteration++ > iterations)
            {
                exit = true;
            }
            remaining -= modelStepTime;
        }
        
        callbackRender();
        
        if (!exit) animFrame( recursiveAnim );
    
    };
    
    pausSwitch.onToggle(function(pause)
    {
       if (pause)
       {
           exit = true;
       }
       else
       {
           exit = false;
           now = Date.now();
           animFrame( recursiveAnim );
       }
    });
    
    // start the mainloop
    animFrame( recursiveAnim );
};

$(document).ready(function()
{ 
   var width = 1200;
   var height = 400;  
   
   var $canvas = $("<canvas/>");
   $canvas.prop("height", height);
   $canvas.prop("width", width);
   $(document.body).append($canvas);
   
   var $info = $("<div/>");
   $(document.body).append($info);
      
   var context = $canvas[0].getContext('2d');
   var line = lineMaker(context, width, height);
   var clearRect = clearMaker(context, width, height);
   var renderText = renderTextMaker(context, width, height);
   var renderDot = dotMaker(context, width, height);
   var angMuscle = angMuscleMaker(context, width, height);
   var renderObj = renderObjMaker(line);

   // DEBUG
   Editor(context, width, height, clearRect, line, renderDot, angMuscle, renderText, renderObj, function(ps, cs, ws)
   {
        var world = makeWorld(width, height, ps, cs, ws);

        var info = function(msg)
        {
            document.title = msg;
        };

        var result = compete(info, 3);
        var netJson = result[0];
        var population = result[1];
        world.net.set(netJson);

        var pausSwitch;

        var replay = function()
        {
            pausSwitch = PausSwitch();

            world = makeWorld(width, height);
            world.net.set(netJson);
        
            simulate(
                world,
                width, 
                height,
                clearRect, 
                line,
                renderObj,
                renderText,
                pausSwitch);  
        };

        $(document).on("keydown", function(e)
        {
            if (e.keyCode == 27)
            {
                pausSwitch.toggle();
                $(document).off();
            }
            if (e.keyCode == 82)
            {
                pausSwitch.toggle();
                replay();
            }
            if (e.keyCode == 78)
            {
                pausSwitch.toggle();
                result = compete(info, e.shiftKey ? 30 : 3, population);
                netJson = result[0];
                population = result[1]
                replay();   
            }
        })

        replay();

    });
});