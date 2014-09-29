var SocketServer = function(options) {

    var mainSocket = options.socket;
    var currentTime = options.timer || Date.now;

    var startTime = currentTime();
    var clientSockets = [];

    mainSocket.on('connection', function(clientSocket) {

        clientSockets.push(clientSocket);

        clientSocket.on('disconnect', function() {
            var index = clientSockets.indexOf(clientSocket);
            if (index > -1) {
                clientSockets.splice(index, 1);
            }
        });

        var send = function(data) {
            clientSocket.emit('data', data);
        };

        clientSocket.on('data', function(data) {

            // Aww its gonna be GREAT to refactor this
            var response = {};
            if (data.token) {
                response.token = data.token;
            }

            if (data.cmd == 'ping') {

                response.cmd = 'pong'
                send(response);

            }
            else if (data.cmd == 'help') {

                response.cmd = 'message';
                response.arg = [
                    'Commands:',
                    '- ping, ask for a pong',
                    '- message (m), send chat message',
                    '- help',
                    '- uptime'
                ];
                send(response);

            } 
            else if (data.cmd == 'uptime') {

                var uptime = currentTime() - startTime;
                response.cmd = 'message';
                response.arg = uptime;
                send(response);

            }
            else if (data.cmd == 'message' || data.cmd == 'm') {

                clientSockets.forEach(function(cs) {
                    if (cs === clientSocket) {
                        response.cmd = 'message';
                        response.arg = 'you: ' + data.arg;
                        cs.emit('data', response);
                    }
                    else {
                        cs.emit('data', {'cmd':'message', 'arg': 'someone: ' + data.arg});
                    }
                });

            }
            else {

                // unknown command
                response.cmd = 'message';
                response.arg = "Unknown command, try 'help'.";
                send(response);

            }

        });

    });

};

var createSocket = function(nodeSocketIo, httpServer) {

    return nodeSocketIo.listen(httpServer);

};

if (typeof module !== 'undefined') {
    module.exports = {
        'SocketServer': SocketServer,
        'createSocket': createSocket
    };
}