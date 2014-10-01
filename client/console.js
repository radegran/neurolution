var Console = {

    'create': function($container) {

        var $messages = $('<div/>');
        var $prompt = $('<div/>');
        var $input = $('<input/>');

        $container.css({
            'position': 'absolute',
            'left': '2px',
            'right': '2px',
            'background-color': '#E0E0F0',
            'padding': '2px',
            'font-family': 'Lucida Console',
            'font-size': '11',
            'opacity': '0.7'
        });
        $messages.css({
            'width': '100%',
            'position': 'absolute',
            'bottom': '20px'
        });
        $prompt.css({
            'position': 'absolute',
            'bottom': '2px',
            'right': '6px',
            'left': '2px'
        });
        $input.css({
            'margin': '0px',
            'padding': '0px',
            'width': '100%',
        })

        $container.append($messages);
        $container.append($prompt);
        $prompt.append($input);

        var promptText = "> ";

        var log = function(message) {

            var logline = function(line) {
                $messages.append($('<div/>').text(line));
            };

            if (Object.prototype.toString.call(message) === '[object Array]') {
                message.forEach(function(line) { logline(line); });
            } else {
                logline(message);
            }
        }

        var onEnterCallbacks = [];
        var onTabCallbacks = [];

        $input.trigger('focus');
        $input.keydown(function (e) {

            if (e.which == 13) {
                
                // Enter
                var text = $input.val();
                log(promptText + text);
                $input.val('');
                onEnterCallbacks.forEach(function(cb) { cb(text); });
  
            } else if (e.which == 27) {
                
                // ESC
                $input.trigger('blur');

            } else if (e.which == 9) {

                // TAB
                onTabCallbacks.forEach(function(cb) { cb($input.val()); });
                return false;

            }
        });

        $input.on('focus', function() { $container.animate({'height': '50%'}, 150); });
        $input.on('blur', function() { $container.animate({'height': '16px'}, 150); });
        $input.trigger('focus');

        return {
            'log': log,
            'onEnter': function(callback) {
                onEnterCallbacks.push(callback);
            },
            'onTab': function(callback) {
                onTabCallbacks.push(callback);
            },
            'text': function(text) {
                $input.val(text);
            },
            'promptText': function() {
                return promptText;
            }
        }
    },

    'getTabCompletions': function(text, scope) {

        var splits = text.split('.');
        var path = splits.slice(0, -1);
        var leaf = splits.slice(-1)[0];

        var prefix = '';
        var cursor = scope;
        
        while (path.length > 0) {

            // Iterate to leaf level

            var key = path.splice(0, 1)[0];
            prefix += '.' + key;

            if (!cursor.hasOwnProperty(key)) {

                // Early exit: Path does not match object hierarchy
                return [];

            }

            cursor = cursor[key];
        }

        var findLeafCompletions = function(keyprefix, obj, grandprefix) {

            var trimLeadingDot = function(str) {
                return str.replace(/^\./, '');
            };

            var list = [];

            for (key in obj) {
                if (obj.hasOwnProperty(key)) {

                    if (key.indexOf(keyprefix) == 0) {

                        var suffix = (Object.prototype.toString.call(obj[key]) === '[object Function]') ? '(' : '';
                        var completion = grandprefix + '.' + key + suffix;
                        list.push(trimLeadingDot(completion));

                    }

                }
            }

            return list;
    
        };
        
        var completions = findLeafCompletions(leaf, cursor, prefix);

        if (completions.length == 1 && completions[0] === text) {

            var deeperCompletions = findLeafCompletions('', cursor[leaf], text);

            if (deeperCompletions.length > 0) {

                return deeperCompletions;

            }

        }

        return completions;

    },

    'attach' : function(cons, client, scope) {

        var attachClient = function() {

            client.on('connect', function() { cons.log('Connected!'); });
            client.on('disconnect', function() { cons.log('Disconnected!'); });

            client.receive(function(data) {

                if (data.cmd == 'message') {
                    if (data.token == 'uptime') {
                        var t = data.arg;
                        var secs = t / 1000;
                        var mins = secs / 60;
                        var hours = mins / 60;
                        var days = hours / 24;
                        var str = days > 1 ? (Math.floor(days) + " days") :
                                  hours > 1 ? (Math.floor(hours) + " hours") :
                                  mins > 1 ? (Math.floor(mins) + " minutes") :
                                  Math.floor(secs) + " seconds";
                        cons.log('Up for ' + str);
                    }
                    else {
                       cons.log(data.arg);
                    }
                }
                else if (data.cmd) {
                    cons.log(data.cmd);
                }
                else {
                    cons.log("Unknown server response!");
                }

            });
        };

        var evalInScope = function(text) {

            var script = "this." + text;

            var f = function() {
                return eval(script);
            };

            try {
                cons.log(f.call(scope));
            } catch (err) {
                cons.log(err);
            } 

        };

        cons.onEnter(function(text) {

            evalInScope(text);

        });

        cons.onTab(function(text) {

            var completions = Console.getTabCompletions(text, scope);
            
            if (completions.length == 1) {

                cons.text(completions[0]);

            } else {

                if (completions.length > 1) {

                    cons.log(cons.promptText() + text);

                }

                completions.forEach(function(completion) { cons.log(completion); });

            }
            
        });

        cons.log("Hit [TAB] for interaction.");

        attachClient();

    }

};