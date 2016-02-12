var takeTopK = function(individs, K)
{
    individs.sort(function(i1, i2) { return i2.score - i1.score; });

    var take = [clone(individs.splice(0, 1)[0])];
    for (var i = 0; i < K-1; i++)
    {
        var ix = Math.floor(individs.length*Math.random()*Math.random());
        take.push(clone(individs.splice(ix, 1)[0]));
    }
    
    return take;
};

var makeIndivids = function(K)
{
    var individs = new Array(K);
    for (var i = 0; i < K; i++)
    {
        individs[i] = makeWorld(600, 400);
    } 
    return individs;   
};

var evalIndivids = function(individs, iterations)
{
    clearScores(individs);
    for (var i = 0; i < individs.length; i++)
    {
        evaluate(individs[i], iterations);
    }     
};

var clone = function(individ)
{
    var genes = individ.net.get();
    var cl = makeWorld(600, 400);
    cl.net.set(genes);
    cl.score = individ.score;
    return cl;
};

var crossOver = function(individs, childrenCount)
{
    var children = [];
    
    for (var i = 0; i < childrenCount; i++)
    {
        var ix1 = Math.floor(Math.random()*individs.length);
        var ix2 = Math.floor(Math.random()*individs.length);
        if (ix1 == ix2)
        {
            // retry
            i--;
            continue;
        }
        
        var genes1 = individs[ix1].net.get();
        var genes2 = individs[ix2].net.get();
        
        var child = makeWorld(600, 400);
        var genes = child.net.get();
        for (var j = 0; j < genes1.length; j++)
        {
            genes[j] = Math.random() > 0.5 ? genes1[j] : genes2[j];
        }
        child.net.set(genes);
        children.push(child);
    }
    
    return children;
};

var mutate = function(individs, prob)
{
    var mutants = [];
    for (var i = 0; i < individs.length; i++)
    {
        var mutant = clone(individs[i]);
        var genes = mutant.net.get();
        for (var j = 0; j < genes.length; j++)
        {
            if (Math.random() < prob)
            {
                genes[j] += 30*(Math.random() - 0.5);
            }
        }
        mutant.net.set(genes);
        mutants.push(mutant);    
    }  
    return mutants;
};

var clearScores = function(individs)
{
    for (var i = 0; i < individs.length; i++)
    {
        individs[i].score = 0;
    }  
};

//var takeTopK = function(individs, K)
//var makeIndivids = function(K)
//var evalIndivids = function(individs, iterations)
//var crossOver = function(individs, childrenCount)
//var mutate = function(individs, prob)

var best;
var compete = function(info, generations, hotstartIndivids)
{
    if (!hotstartIndivids)
    {
        best = null;
    }
    
    var inds = hotstartIndivids || makeIndivids(42);      
    
    var c = 0;
    while (c++ < generations)
    {
        evalIndivids(inds, 2000);
        
        console.log("=== Ny vända! ===");
        for (var i = 0; i < inds.length; i++)
        {
            console.log(c + " ("+i+") >> " +inds[i].score);
        }
        
        inds = takeTopK(inds, 10);
        if (!best)
        {
            best = clone(inds[0]);
        }
        else if (inds[0].score > best.score)
        {
            best = clone(inds[0]);
        }        
        
        info("gen " + c + ":" + best.score);
        
        inds = inds.slice(0, 3)
            .concat(crossOver(inds, 27))
            .concat(mutate(inds, 0.15));
           
    }
    
    info("best: " + best.score);
    
    return [best.net.get(), inds];
}