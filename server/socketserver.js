var SocketServer = function(options) {

    var mainSocket = options.socket;
    var currentTime = options.timer || Date.now;
    var commands = options.commands || {};

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

        clientSocket.on('data', function(data) {

            var sendMessage = function(socket, message) {

                socket.emit('data', {'cmd': 'message', 'arg': message, 'token': data.token});

            };

            var sender = {

                'sendMessage': function(message) {

                    sendMessage(clientSocket, message)

                },

                'broadcastMessage': function(message) {
                    
                    clientSockets.forEach(function(cs) {
                        if (cs !== clientSocket) {
                            sendMessage(cs, message);
                        }                    
                    });

                }

            };

            var response = {'token': data.token};

            if (commands.hasOwnProperty(data.cmd)) {

                var command = commands[data.cmd];
                command.handler(sender, data.arg);

            } else {

                sendMessage(clientSocket, "Unknown command, try 'help'");

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