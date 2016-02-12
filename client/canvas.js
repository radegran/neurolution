var lineMaker = function(context, width, height)
{
    return function(p1, p2, color)
    {
        context.beginPath();
        context.moveTo(p1.x, height - p1.y);
        context.lineTo(p2.x, height - p2.y);
        context.lineWidth = 1;

        // set line color
        context.strokeStyle = color || '#ff0000';
        context.stroke();
    };
};

var renderObjMaker = function(line)
{
    return function(vs, cs)
    {
        var fromV, toV;
        for (var i = 0; i < cs.length; i++)
        {
            fromV = vs[cs[i].from];
            toV = vs[cs[i].to];
            
            line(fromV, toV)
        }    
    };
};

var clearMaker = function(context, width, height)
{
    return function() 
    {
        context.clearRect(0, 0, width, height);   
    };
};

var dotMaker = function(context, width, height)
{
    return function(x, y, color, bordercolor) 
    {
        context.beginPath();
        context.arc(x, height - y, 3, 0, 2 * Math.PI, false);
        context.closePath();
        
        if (color)
        {
            context.fillStyle = color;
            context.fill();            
        }
        if (bordercolor)
        {
            context.lineWidth = 1;
            context.strokeStyle = bordercolor;
            context.stroke();            
        }
    };
};

var renderTextMaker = function(context, width, height)
{
    return function(text, x, y, color, size) 
    {
        context.font = (size || 10) + "px Arial";
        context.fillStyle = color || 'black';
        context.fillText(text,x,height - y);
    };
};

var angMuscleMaker = function(context, width, height)
{
    return function(pFrom, pVia, pTo, color)
    {
        var v1 = sub(pFrom, pVia);
        var v2 = sub(pTo, pVia);
        v1.y *= -1;
        v2.y *= -1;
        var p10 = p(1, 0);
        var a1 = angle(p10, v1);
        var a2 = angle(p10, v2);
        context.beginPath();
        context.arc(pVia.x, height - pVia.y, 20, a1, a2);
        context.lineWidth = 2;
        
        context.strokeStyle = color;
        context.stroke();
    };
}

var Editor = function(canvas, width, height, clearF, lineF, dotF, angMuscleF, rendertext, renderObj, doneCallback)
{
    var ps = [];
    var cs = [];
    var ws = [];
    var ground = Ground(width);
 
    $(document).on("keydown", function(e)
    {
        if (e.keyCode == 13)
        {
            if (ps.length == 0)
            {
                window.load(window.localStorage.getItem("obj"));
                return;
            }
            
            $(document).off("keydown");
            $("canvas").off("mousedown");
            rendertext("Nu tränas det! Tryck sen på R för att simulera igen och N för att träna mer.", 10, 170, 'black', 20);
            
            // Serialize to console
            var obj = {"ps": ps, "cs": cs, "ws": ws};
            console.log(JSON.stringify(obj));
            window.localStorage.setItem("obj", JSON.stringify(obj));
            
            setTimeout(function() { doneCallback(ps, cs, ws) }, 100);
        }
    });
           
    var hFrom = null;
    var hTo = null;
    var hIsConnection = false;
    
    var render = function()
    {
        clearF();
        
        rendertext("Klicka för att sätta ut noder", 10, 43, 'gray');
        rendertext("Dra kanter mellan dem", 10, 33, 'gray');
        rendertext("Klicka på en kant för att göra till en muskel", 10, 23, 'gray');
        rendertext("Klick/dra mellan två kanter för att göra med vinkelmuskel", 10, 13, 'gray');
        rendertext("Tryck på ENTER när du är klar!", 10, 3, 'gray');
        lineF(p(300, 0), p(300,height), "lightgray");
        rendertext("En figur skapad på den här sidan vill ta sig till höger", 10, height-10, 'gray');
        rendertext("En figur skapad på den här sidan vill hoppa", 330, height - 10, 'gray');       
                
        // ground
        renderObj(ground.groundPs, ground.groundCs);
        
        for (var i = 0; i < ps.length; i++)
        {
            dotF(ps[i].x, ps[i].y, "red");
        }
        for (var i = 0; i < cs.length; i++)
        {
            lineF(ps[cs[i].from], ps[cs[i].to], cs[i].isMuscle ? "blue" : "red");
        }
        for (var i = 0; i < ws.length; i++)
        {
            angMuscleF(ps[ws[i].from], ps[ws[i].via], ps[ws[i].to], "blue");
        }
        
        if (hFrom && hTo)
        {
            lineF(hFrom, hTo, hIsConnection ? "blue": "red");
        }
    };
    
    var toggleAngularMuscle = function(wIn)
    {
        for (var i = 0; i < ws.length; i++)
        {
            if (wIn.via == ws[i].via)
            {
                if (wIn.from == ws[i].from && wIn.to == ws[i].to ||
                    wIn.from == ws[i].to && wIn.to == ws[i].from)
                {
                    // already there!
                    ws.splice(i, 1);
                    return;
                }
            }
        }
        
        ws.push(wIn);
    };
    
    var getP = function(e)
    {
        var posX = $(e.target).position().left,
            posY = $(e.target).position().top;
        var x = e.pageX - posX;
        var y = height - (e.pageY - posY);
        return p(x, y);
    };
    
    var nearestPoint = function(p)
    {
        var minDist = 1e10;
        var pNearest = null;
        
        for (var i = 0; i < ps.length; i++)
        {
            var d = dist(p,  ps[i]);
            if (d < minDist)
            {
                minDist = d;
                pNearest = ps[i];
            }    
        }  
        
        return pNearest;
    };
    
    var middlePofConn = function(conn)
    {
        var p1 = ps[conn.from];
        var p2 = ps[conn.to];
        return p( (p1.x + p2.x)/2, (p1.y + p2.y)/2 );
    };

    var nearestConnection = function(p)
    {
        var minDist = 1e10;
        var cNearest = null;
        
        for (var i = 0; i < cs.length; i++)
        {
            var middle = middlePofConn(cs[i]);
            
            var d = dist(p,  middle);
            if (d < minDist)
            {
                minDist = d;
                cNearest = cs[i];
            }    
        }  
        
        return cNearest;
    };
    
    var addConnection = function(from, to)
    {
        var fromIx = ps.indexOf(from);
        var toIx = ps.indexOf(to);
        
        for (var i = 0; i < cs.length; i++)
        {
            if (cs[i].from == fromIx && cs[i].to == toIx)
            {
                // already added
                return;
            }
        }
        
        var conn = c(fromIx, toIx);
        conn.isMuscle = false;
        cs.push(conn);  
    };
    
    var removePoint = function(p)
    {
        var ix = ps.indexOf(p);
        ps.splice(ix, 1);
    
        // purge and update connections    
        var removeList = [];
        for (var i = 0; i < cs.length; i++)
        {
            if (cs[i].from == ix || cs[i].to == ix)
            {
                removeList.push(i);
                continue;
            }
            if (cs[i].from > ix) cs[i].from--;
            if (cs[i].to > ix) cs[i].to--;
        }  
        for (var i = removeList.length-1; i >= 0; i--)
        {
            cs.splice(removeList[i], 1);
        }
        
        // purge and update angular connections
        removeList = [];
        for (var i = 0; i < ws.length; i++)
        {
            if (ws[i].from == ix || ws[i].to == ix || ws[i].via == ix)
            {
                removeList.push(i);
                continue;
            }
            if (ws[i].from > ix) ws[i].from--;
            if (ws[i].to > ix) ws[i].to--;
            if (ws[i].via > ix) ws[i].via--;
        }  
        for (var i = removeList.length-1; i >= 0; i--)
        {
            ws.splice(removeList[i], 1);
        }
    };
    
    var removeConnection = function(connection)
    {
        var ix = cs.indexOf(connection);
        cs.splice(ix, 1);          
    };
    
    var snap = 15;
    
    $("canvas").on("mousedown", function(e)
    {
        hFrom = getP(e);
        hTo = getP(e);
        var nearestHFrom = nearestPoint(hFrom);
        var nearestConn = nearestConnection(hFrom);
        
        var distNearPoint = nearestHFrom ? dist(hFrom, nearestHFrom) : 1e10;
        var distNearConn = nearestConn ? dist(hFrom, middlePofConn(nearestConn)) : 1e10;
        
        hIsConnection = false;
        
        if (distNearPoint < snap && distNearPoint < distNearConn)
        {
            hFrom = p(nearestHFrom.x, nearestHFrom.y);
        }
        else if (distNearConn < snap && distNearConn < distNearPoint)
        {
            hFrom = middlePofConn(nearestConn);
            hIsConnection = true;
        }
        
        render();     
        
        $("canvas").on("mousemove", function(e)
        {
            hTo = getP(e);
            render();
        });
    
        $("canvas").on("mouseup", function(e)
        {
            if (hIsConnection)
            {
                var fromConn = nearestConn;
                // connection logic
                var toConn = nearestConnection(hTo);
                if (nearestConn.from == toConn.from && nearestConn.to == toConn.to)
                {
                    // same connection for mouse down and mouse up
                    toConn.isMuscle = !toConn.isMuscle;
                }
                else
                {
                    // angular muscle!
                    
                    var c1 = [fromConn.from, fromConn.to];
                    var c2 = [toConn.from, toConn.to];
                    var cL = c1.concat(c2).sort();
                    
                    var allIndexesUnique = cL[0] != cL[1] && cL[1] != cL[2] && cL[2] != cL[3];
                    if (!allIndexesUnique)
                    {
                        var middleIx;
                        if (c1[0] == c2[0] || c1[0] == c2[1])
                        {
                            middleIx = c1[0];
                        }
                        else
                        {
                            middleIx = c1[1];
                        }
                        
                        var otherIxs = cL.filter(function(e) { return e != middleIx; });
                        if (otherIxs.length != 2)
                        {
                            alert("woooot!")
                        }
                        
                        toggleAngularMuscle(w(otherIxs[0], middleIx, otherIxs[1]));
                    }
                }
            }
            else
            {
                // point logic
                var nearestHTo = nearestPoint(hTo);
                    
                if (dist(hFrom, hTo) < snap)
                {
                    if (nearestHFrom && dist(hFrom, nearestHFrom) < snap)
                    {
                        removePoint(nearestHFrom);
                    }
                    else
                    {
                        ps.push(hFrom);                
                    }
                }
                else
                {
                    // new connection
                    if (nearestHFrom && dist(hFrom, nearestHFrom) < snap &&
                        nearestHTo && dist(hTo, nearestHTo) < snap)
                    {
                        addConnection(nearestHFrom, nearestHTo);
                    }   
                }    
            }
            
            hFrom = null;
            hTo = null;
            render();
            $("canvas").off("mousemove mouseup");
        });
    }); 
        
    // HIDDEN FEATURE 
    window.load = function(serializedString)
    {
        var obj = JSON.parse(serializedString);
        ps = obj.ps;
        cs = obj.cs;
        ws = obj.ws;
        render();  
    };
    
    render();

};
