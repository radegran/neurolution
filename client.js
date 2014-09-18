$(document).ready(function() {

    var socket = io();
    var client = Client(socket);
    var cons = Console($('#console'));
    MainView($('#main'));

    cons.onInput(function(text) {

        var strs = text.split(' ');
        var request = {};
        request.cmd = strs.shift();
        request.arg = strs.join(' ');
        request.token = request.cmd

        client.send(request);

    });

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
        else if (data.err) {
            cons.log('Error: ' + data.err);
        }
        else {
            cons.log("Unknown server response!");
        }

    });

});
