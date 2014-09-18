var Console = function($container) {

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
            // Enter
            if (inputCallback) {
                var text = $input.val();
                inputCallback(text);
                log("> " + text);
                $input.val('');
            }
        } else if (e.which == 27) {
            // ESC
            $input.trigger('blur');
        }
    });

    $input.on('focus', function() { $container.animate({'height': '50%'}, 150); });
    $input.on('blur', function() { $container.animate({'height': '16px'}, 150); });
    $input.trigger('focus');

    return {
        'log': log,
        'onInput': function(callback) {
            inputCallback = callback;
        }
    }
};