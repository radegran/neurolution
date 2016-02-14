var setGravity = function(as, G)
{
    for (var i = 0; i < as.length; i++)
    {
        as[i].x = 0;
        as[i].y = G;
    }
};

var stepObj = function(dt, ps, vs, as)
{
    for (var i = 0; i < vs.length; i++)
    {
        vs[i].x += as[i].x * dt / 1000;
        vs[i].y += as[i].y * dt / 1000;        
        
        ps[i].x += vs[i].x * dt / 1000;
        ps[i].y += vs[i].y * dt / 1000;
    }       
};


var G = -250;
var Cp = 500;
var Cv = 1;

var applyForces = function(dt, groundPs, groundCs, ps, vs, as, ws, cs, line)
{
    var p1, p2, v1, v2, a1, a2, restLen, len, lenv, diff, diffv;

    for (var i = 0; i < cs.length; i++)
    {
        p1 = ps[cs[i].from];
        p2 = ps[cs[i].to];
        a1 = as[cs[i].from];
        a2 = as[cs[i].to];
        v1 = vs[cs[i].from];
        v2 = vs[cs[i].to];
        
        restLen = cs[i].len;
        len = dist(p2, p1) || 0.1;
        diff = scale(sub(p2, p1), 1/len);
        
        lenv = dist(v2, v1);
        diffv = scale(sub(v2, v1), 1/(lenv || 1e20));
        var prod = dot(diff, diffv);
        
        var corr = scale(diff, Cp*(len-restLen));
        var corrv = scale(diff, Math.sqrt(Cp)*lenv*prod);
       
        // a1.x += (corr.x + corrv.x);
        // a1.y += (corr.y + corrv.y);
        // a2.x -= (corr.x + corrv.x);
        // a2.y -= (corr.y + corrv.y);
        a1.x += (corr.x + corrv.x);
        a1.y += (corr.y + corrv.y);
        a2.x -= (corr.x + corrv.x);
        a2.y -= (corr.y + corrv.y);

    } 
    
    // angle
    
    var pFrom, pVia, pTo, ang, restAng, p1Rot, dP1, p2Rot, dP2;
    var W = 2000;
    
    
    for (var i = 0; i < ws.length; i++)
    {
        pFrom = ps[ws[i].from];
        pVia = ps[ws[i].via];
        pTo = ps[ws[i].to];
        var aFrom = as[ws[i].from];
        var aVia = as[ws[i].via];
        var aTo = as[ws[i].to];
        restAng = ws[i].angle;
        
        p1 = sub(pFrom, pVia);
        p2 = sub(pTo, pVia);
        
        ang = angle(p1, p2);

        var angErr = angleDiff(ang, restAng);
        var corrAng = W * angErr;
        var angleVel = angleDiff(ang, (ws[i]._prevAng || ang)) / (dt / 1000);
        var corrAngVel = 5*2 * Math.sqrt(W) * angleVel;
        
        var p1Orth = normalize(orth(p1));
        var p2Orth = normalize(orth(p2));

        addMe(aFrom, scale(p1Orth, (corrAng + corrAngVel)));
        addMe(aVia, scale(p1Orth, -(corrAng + corrAngVel)));
        addMe(aTo, scale(p2Orth, -(corrAng + corrAngVel)));
        addMe(aVia, scale(p2Orth, (corrAng + corrAngVel)));

        ws[i]._prevAng = ang;
    }
    
    // ground
    for (var i = 0; i < ps.length; i++)
    {
        var penetration = groundPs[0].y - ps[i].y;
        if (penetration >= 0)
        {
            
            // var force = -vs[i].x / ( dt/1000 );
            // var ratio = Math.min(-10*G, Math.max(0, -as[i].y)) / (-10*G);
            // as[i].x = (as[i].x*(1-ratio) + force*ratio);
            
            as[i].x = 0;
            vs[i].x = 0;
        }
    }
    
};

var collide = function(groundPs, groundCs, ps, vs, as)
{
    // TODO: complex ground?
    var penetration;
    for (var i = 0; i < ps.length; i++)
    {
    
        // if (i == 0)
        // {
        //     console.log(vs[i].y)
        // }
        
        penetration = groundPs[0].y - ps[i].y;
        if (penetration > 0 && vs[i].y < 0)
        {
            ps[i].y += penetration;
            vs[i].y *= -1/2;
        }
        
        if (ps[i].y < groundPs[0].y)
        {
            ps[i].y = groundPs[0].y
        }
    }
};
