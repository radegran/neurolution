var Core = {

    'Loop': function(func) {

        var alive = true;
        var prevtime = Date.now();

        var internalloop = function()
        {
            if (!alive)
                return;
            
            requestAnimationFrame(internalloop);
            
            var currtime = Date.now();
            var deltatime = currtime - prevtime;
            prevtime = currtime;

            try {
                func(deltatime);
            } catch (e) {
                alive = false;
                throw e;
            }

        };

        internalloop();

        return {
            kill: function() { alive = false; }
        };

    }

};

if (typeof module !== 'undefined') {
    module.exports = {
        'Loop': Core.Loop
    };
}