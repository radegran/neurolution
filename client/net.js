var Net = function(numInput, numHidden, numOutputs)
{
    var zeroes = function(length)
    {
        var list = new Array(length);
        for (var i = 0; i < list.length; i++)
        {
            list[i] = 0;
        }  
        return list;
    };
    
    var ijW = zeroes(numInput*numHidden);
    var jB = zeroes(numHidden);
    
    var jkW = zeroes(numHidden*numOutputs);
    var ikW = zeroes(numInput*numOutputs);
    var kB = zeroes(numOutputs);
    
    var rnd = function()
    {
        return Math.random()/2 - 0.25;
    }
    
    var initialize = function()
    {
        // ijW
        for (var i = 0; i < numInput; i++)
        for (var j = 0; j < numHidden; j++)
        {
            ijW[i*numHidden + j] = 0; //rnd();
        }
        
        // jB
        for (var j = 0; j < numHidden; j++)
        {
            jB[j] = 0; //rnd()*numInput;
        }
        
        // jkW
        for (var j = 0; j < numHidden; j++)
        for (var k = 0; k < numOutputs; k++)
        {
            jkW[j*numOutputs + k] = 0; //rnd();
        }
        
        // ikW
        for (var i = 0; i < numInput; i++)
        for (var k = 0; k < numOutputs; k++)
        {
            ikW[i*numOutputs + k] = 1;
        }
        
        // kB
        for (var k = 0; k < numOutputs; k++)
        {
            kB[k] = 0; //rnd()*numHidden;
        }
    };
    
    
    var hiddenVs = zeroes(numHidden);
    var outputs = zeroes(numOutputs);
    var reset = function(list)
    {
        for (var i = 0; i < list.length; i++)
        {
            list[i] = 0;
        }
    }
    
    var evaluate = function(inputs)
    {
        reset(hiddenVs);
        reset(outputs);
        
        if (inputs.length != numInput)
        {
            throw "bad input";
        }
        
        // hidden values
        for (var j = 0; j < numHidden; j++)
        {
            for (var i = 0; i < numInput; i++)
            {
                hiddenVs[j] += inputs[i] * ijW[i*numHidden + j];          
            }
            hiddenVs[j] -= jB[j];
            //hiddenVs[j] = 1/(1 + Math.exp(-hiddenVs[j]));
        }
      
      
        for (var k = 0; k < numOutputs; k++)
        {
            for (var j = 0; j < numHidden; j++)
            {
                outputs[k] += hiddenVs[j] * jkW[j*numOutputs + k];          
            }
            
            // Add connection from input here too!!!
            for (var i = 0; i < numInput; i++)
            {
                outputs[k] += inputs[i] * ikW[i*numOutputs + k];          
            }

            outputs[k] -= kB[k];
            outputs[k] = 1/(1 + Math.exp(-outputs[k]/(numOutputs/2 + numInput/2)));
        }
      
        return outputs;
    };
     
    // var ijW = zeroes(numInput*numHidden);
    // var jB = zeroes(numHidden);
    // 
    // var jkW = zeroes(numHidden*numOutputs);
    // var kB = zeroes(numOutputs);
    
    var get = function()
    {
        return ijW.concat(jB.concat(jkW.concat(kB.concat(ikW))));
    };
    
    var set = function(list)
    {
        var i1 = numInput*numHidden;
        var i2 = i1 + numHidden;
        var i3 = i2 + numHidden*numOutputs;
        var i4 = i3 + numOutputs;
        var i5 = i4 + numInput*numOutputs;
        
        ijW = list.slice(0, i1);
        jB = list.slice(i1, i2);
        jkW = list.slice(i2, i3);
        kB = list.slice(i3, i4);
        ikW = list.slice(i4, i5);        
    };
    
    var getEmptyNet = function()
    {
        return Net(numInput, numHidden, numOutputs);
    };
    
    return {
        "initialize": initialize,
        "eval": evaluate,
        "get": get,
        "set": set,
        "getEmptyNet": getEmptyNet      
    }
};