var Commands = 
{

    'Command': function(keyword, handler) {

        var command = {
            'keyword': keyword,
            'handler': handler || function(response) {}
        };

        return command;
    },

    'UpTime': function(currentTimeFunc) {

        currentTimeFunc = currentTimeFunc || Date.now;
        var startTime = currentTimeFunc();

        return Commands.Command('uptime', function(response) { 
                response.sendMessage(currentTimeFunc() - startTime); 
            });

    },

    'TestDb': function(db) {

        return Commands.Command('testdb', function(response, arg) {

            db.find({'id': 'test'}, function(obj) {

                var counter = 0;

                if (obj)
                {
                    counter = obj.counter;
                    db.remove(obj);                    
                }

                db.save({'id': 'test', 'counter': counter+1}, function(obj) {
                    
                    if (!obj) {
                        response.sendMessage("Oops. Something went wrong...");
                    }
                    else {
                        response.sendMessage("Counter: " + counter);                        
                    }

                });

            });

        });

    },

    'get': function(db) {

        var commands = [

            Commands.Command('ping', function(response) { 
                    response.sendMessage('pong');
                }),
            Commands.UpTime(),
            Commands.Command('message', function(response, arg) {
                    response.broadcastMessage('someone: ' + arg);
                    response.sendMessage('you: ' + arg);
                }),
            Commands.TestDb(db)

        ];

        return commands;

    },

    'getDictionary': function(client) {

        var commands = Commands.get(null);
        var dict = {};

        commands.forEach(function(c) { dict[c.keyword] = function(arg) {

                client.send({
                    'cmd': c.keyword,
                    'arg': arg,
                    'token': c.keyword
                });

            }; 
        });
        
        return dict;

    }

};

if (typeof module !== 'undefined') {
    module.exports = {
        'get': Commands.get
    };
}