$(document).ready(function() {

    var socket = io();
    var client = Client(socket);
    var cons = Console();

    cons.onInput(function(text) {

        var strs = text.split(' ');
        var cmd = strs.shift();
        var arg = strs.join(' ');

        client.send({'cmd': cmd, 'arg': arg});

    });

    client.on('connect', function() { cons.log('Connected!'); });
    client.on('disconnect', function() { cons.log('Disconnected!'); });
    client.receive(function(data) {

        if (data.cmd == 'message') {
            cons.log(data.arg);
        }
        else if (data.cmd) {
            cons.log(data.cmd);
        }
        else if (data.err) {
            cons.log('Error: ' + data.err);
        }
        else {
            cons.log("Unknown server response!");
        }

    });

});
