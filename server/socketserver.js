var Server = function(mainSocket) {

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

            if (data.cmd == 'ping') {
                send({'cmd':'pong'});
            }
            else if (data.cmd == 'help') {
                send({'cmd': 'message', 'arg': [
                    'Commands:',
                    '- ping, ask for a pong',
                    '- message (m), send chat message',
                    '- help, show this text'
                ]});
            } 
            else if (data.cmd == 'message' || data.cmd == 'm') {
                clientSockets.forEach(function(cs) {
                    if (cs === clientSocket) {
                        cs.emit('data', {'cmd':'message', 'arg': 'you: ' + data.arg});
                    }
                    else {
                        cs.emit('data', {'cmd':'message', 'arg': 'someone: ' + data.arg});
                    }
                });
            }
            else {
                // assume 'help' command
                send({'cmd':'message', 'arg': "Unknown command, try 'help'."});
            }

        });

    });

};

if (typeof module !== 'undefined') {
    module.exports = {
        'Server': Server
    };
}