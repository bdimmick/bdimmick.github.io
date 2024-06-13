hiddenFiles = ["index.js"]

 function addPadding (val, len) {
    while (val.length < len) {
        val = val + " "
    }
    return val
}

valueOrDefault = function (v, def) {
    return (typeof v !== 'undefined' ? v : def)
}

displayOutput = function (output, append) {
    append = valueOrDefault(append, false)
    if (append) {
        output = $('div#output').text() + output + "\n"
    }
    $('div#output').text(output)
}

function failCatCommand(f) {
    displayOutput("cat: " + f + ": No such file or directory", true)
}

commands = {
    'help': [
        "Displays this message.",
        function (params) {
            keys = []
            maxlen = 0
            $.each(commands, function (k, v) {
                keys.push(k)
                if (k.length > maxlen) {
                    maxlen = k.length
                }
            })
            keys.sort()
            keys.forEach(function (k) {
                displayOutput(addPadding(k, maxlen) + " - " + commands[k][0], true)
            })
        }
    ],
    'cat': [
        "Prints a file.",
        function (params) {
            params.forEach(function (f) {
                f = f.toLowerCase()
                if (hiddenFiles.includes(f)) {
                    failCatCommand(f)
                } else {
                    $.get('/' + f, function (data) {
                        displayOutput(data, true)
                    }).fail(function () {
                        failCatCommand(f)
                    })
                }
            })
        }
    ],
    'curl': [
        "Loads a URL in a new window.",
        function (params) {
            window.open(params[0])
        }
    ],
    'clear': [
        'Clears the output.',
        function (params) {
            displayOutput("")
        }
    ]
}

function executeCommand (input) {
    command = input.trim().split(' ')
    target = command[0]
    entry = commands[target]
    displayOutput("")
    if (typeof entry != 'undefined') {
        command.shift()
        entry[1](command)
    } else {
        displayOutput("'" + target + "' - command not found.")
    }
}

$(function () {
    $('body').keypress(
        function (event) {
            current = $('span#input').text().toString()
            if (event.keyCode == 13) { // handle return
                current.split(';').forEach(
                    function (command) {
                        executeCommand(command.trim().split(' '))
                    }
                )

                $('span#input').text('')
            } else if (event.keyCode == 8) { // handle delete
                if (current.length > 0) {
                    $('span#input').text(current.slice(0, current.length - 1))
                }
            } else {
                $('span#input').text(current + String.fromCharCode(event.charCode))
            }
            event.preventDefault()
            return false
        })
})
