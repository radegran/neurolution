var Console = function($container) {

    var $messages = $('<div/>');
    var $prompt = $('<div/>');
    var $input = $('<input/>');

    $container.css({
        'position': 'absolute',
        'left': '2px',
        'right': '2px',
        'height': '200px',
        'background-color': '#E0E0F0',
        'padding': '2px',
        'font-family': 'Lucida Console',
        'font-size': '11'
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

    var inputCallback = function() {};
    $input.trigger('focus');
    $input.keydown(function (e) {
        if (e.which == 13) {
            if (inputCallback) {
                var text = $input.val();
                inputCallback(text);
                log("> " + text);
                $input.val('');
            }
        }
    });

    return {
        'log': log,
        'onInput': function(callback) {
            inputCallback = callback;
        }
    }
};