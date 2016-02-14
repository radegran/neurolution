var dist = function(p1, p2)
{
    if (!p2)
    {
        return Math.sqrt(p1.x*p1.x + p1.y*p1.y);
    }
    var xdiff = p1.x - p2.x;
    var ydiff = p1.y - p2.y;
    return Math.sqrt(xdiff*xdiff + ydiff*ydiff);
}

var sub = function(p1, p2)
{
    return {x: p1.x - p2.x, y: p1.y - p2.y};  
};

var add = function(p1, p2)
{
    return {x: p1.x + p2.x, y: p1.y + p2.y};  
};

var addMe = function(me, p)
{
    me.x += p.x;
    me.y += p.y;
};

var scale = function(p, val)
{
    return {x: p.x*val, y: p.y*val};
};

var dot = function(p1, p2)
{
    return p1.x*p2.x + p1.y*p2.y;  
};

var angleDiff = function(a, b)
{
  if (isNaN(a) || isNaN(b))
  {
      throw "angleDiff OOPS! " + a + ", " + b;
  }
  if (a >= b)
  {
      if ((a - b) < Math.PI)
      {
          return a - b;
      }
      else
      {
          return a - (b + 2*Math.PI);
      }
  }
  else
  {
      return -angleDiff(b, a);
  }  
};

var normalize = function(v)
{
    var l = dist(v) || 1e20;
    return {x: v.x / l, y: v.y / l};  
};

var addMe = function(v1, v2)
{
    v1.x += v2.x;
    v1.y += v2.y;  
};

var subMe = function(v1, v2)
{
    v1.x -= v2.x;
    v1.y -= v2.y;  
};

var rotate = function(v, angle)
{
    return p(Math.cos(angle)*v.x - Math.sin(angle)*v.y,
             Math.sin(angle)*v.x + Math.cos(angle)*v.y);  
};

var orth = function(v)
{
    return {x: -v.y, y: v.x};
};

var angle = function(v1, v2)
{
    var v1N = scale(v1, 1/dist(v1));
    var v2N = scale(v2, 1/dist(v2));
    var s = Math.sign(dot(orth(v1), sub(v2, v1)));
    
    if (s >= 0)
        return Math.acos(dot(v1N, v2N));
    else
        return 2*Math.PI - Math.acos(dot(v1N, v2N));    
};
