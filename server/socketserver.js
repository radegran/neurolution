var SocketServer = function(options) {

    var mainSocket = options.socket;
    var commands = {};
    var clientSockets = [];

    // Store commands in dictionary
    (options.commands || []).forEach(function(command) {

        commands[command.keyword] = command;

    });

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

                sendMessage(clientSocket, "Unknown command, try [TAB]");

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