// DOM elements being used by the functions below:
let body = $('body')
let inputSpan = $('span#input')
let outputDiv = $('div#output')

// Behavior control data
let hiddenFiles = ["index.js"]
let defaultExitTarget = 'https://google.com'



function isUndefined(value) {
    return typeof value !== 'undefined'
}

function addPadding (val, len) {
    while (val.length < len) {
        val = val + " "
    }
    return val
}

 function valueOrDefault(value, def) {
    return (isUndefined(value) ? value : def)
}

 function displayOutput(output, append) {
    append = valueOrDefault(append, false)
    if (append) {
        output = outputDiv.text() + output + "\n"
    }
     outputDiv.text(output)
}

function setOrGetInput(input, append) {
    let current = inputSpan.text()
    if (isUndefined(input)) {
        console.debug('executing set in setOrGetInput')
        append = valueOrDefault(append, false)
        if (append) {
            inputSpan.text(current + input)
        } else {
            inputSpan.text(input)
        }
    } else {
        console.debug('executing get in setOrGetInput')
        return current
    }
}

function failCatCommand(f) {
    displayOutput("cat: " + f + ": No such file or directory", true)
}

commands = {
    'help': {
        info: "Displays this message.",
        exec: function(params) {
            let keys = []
            let maxlen = 0
            $.each(commands, function (k, v) {
                keys.push(k)
                if (k.length > maxlen) {
                    maxlen = k.length
                }
            })
            keys.sort()
            keys.forEach(function (k) {
                displayOutput(addPadding(k, maxlen) + " - " + commands[k].info, true)
            })
        }
    },
    'cat': {
        info: "Prints a file.",
        exec: function (params) {
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
    },
    'curl': {
        info: "Loads a URL in a new window.",
        exec: function (params) {
            window.open(params[0])
        }
    },
    'clear': {
        info: 'Clears the output.',
        exec: function (params) {
            displayOutput("")
        }
    },
    'exit': {
        exec: function(params) {
            if (window.history.length > 0) {
                window.history.back()
            } else {
                window.location.replace(defaultExitTarget)
            }
        }
    }
}

function executeCommand (input) {
    input = input.toString().trim()
    if (input.length > 0) {
        let command = input.toString().trim().split(' ')
        let target = command[0]
        let entry = commands[target]
        displayOutput("")
        if (isUndefined(entry)) {
            command.shift()
            entry.exec(command)
        } else {
            displayOutput("'" + target + "' - command not found.")
        }
    }
}

$(function () {
    // handles special cases that keypress suppresses or cannot handle
    let handleKeydown = function (event) {
        let current = setOrGetInput()
        let doContinue = true
        console.debug("keydown w/ " + event.keyCode + " w/ current : " + current)
        if (event.keyCode === 8) { // handle delete
            if (current.length > 0) {
                setOrGetInput(current.slice(0, current.length - 1))
            }
            doContinue = false
        }

        if (doContinue) {
            return true
        } else {
            event.preventDefault()
            return false
        }
    }

    // handles normal characters and return
    let handleKeypress = function (event) {
        let current = setOrGetInput()
        let keyCode = event.keyCode || event.which
        console.debug("keypress w/ " + keyCode + " w/ current : " + current)
        if (keyCode === 13) { // handle return
            current.split(';').forEach(
                function (command) {
                    executeCommand(command)
                }
            )
            setOrGetInput('')
        } else {
            setOrGetInput(String.fromCharCode(event.charCode), true)
        }
        event.preventDefault()
        return false
    }


    body.on('keydown', handleKeydown)
    body.keypress(handleKeypress)
})
