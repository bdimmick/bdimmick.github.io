hiddenFiles = ["index.js"]

 function addPadding (val, len) {
    while (val.length < len) {
        val = val + " "
    }
    return val
}

 function valueOrDefault(v, def) {
    return (typeof v !== 'undefined' ? v : def)
}

 function displayOutput(output, append) {
    append = valueOrDefault(append, false)
    if (append) {
        output = $('div#output').text() + output + "\n"
    }
    $('div#output').text(output)
}

function setOrGetInput(input, append) {
    current = $('span#input').text()
    if (input !== 'undefined') {
        append = valueOrDefault(append, false)
        if (append) {
            $('span#input').text(current + input)
        } else {
            $('span#input').text(input)
        }
    } else {
        return current
    }
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
    command = input.toString().trim().split(' ')
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
            current = setOrGetInput()
            if (event.keyCode == 13) { // handle return
                current.split(';').forEach(
                    function (command) {
                        executeCommand(command)
                    }
                )
                setOrGetInput('')
            } else if (event.keyCode == 8) { // handle delete
                if (current.length > 0) {
                    setOrGetInput(current.slice(0, current.length - 1))
                }
            } else {
                setOrGetInput(String.fromCharCode(event.charCode), true)
            }
            event.preventDefault()
            return false
        })
})
