execute_on = true

pad_to = function(val, len) {
	while (val.length < len) {
		val = val + " "
	}
	return val
}

default_value = function(v, def) {
	return (typeof v !== 'undefined' ?  v : def)
}

display_output = function(output, append) {
	append = default_value(append, false) 
	if (append) {
		output = $('div#output').text() + output
	}
	$('div#output').text(output)
}

commands = {
	'help': [
		"Displays this message.",
		function(params) {
			keys = []
			maxlen = 0
			$.each(commands, function(k, v) { 
				keys.push(k) 
				if (k.length > maxlen) {
					maxlen = k.length
				}
			})
			keys.sort()
			keys.forEach(function(k) {
				display_output(pad_to(k, maxlen) + " - " + commands[k][0] + "\n", true)
			})
		}
	],
	'cat': [
		"Prints a file.",
		function(params) { 
			params.forEach(function(f) {
				$.get('/' + f,
        	function(data) { display_output(data + "\n", true) }
      	).fail( function() { display_output("cat: " + f + ": No such file or directory\n", true) })
			})
		}
	],
	'curl': [
		"Loads a URL in a new window.",
		function(params) { window.open(params[0]) }
	],
	'clear': [
		'Clears the output.',
		function(params) { display_output("") }
	]
}

execute = function(cmd) {
	if (execute_on) {
		c = cmd[0]
		entry = commands[c]
		display_output("")
		if (typeof entry != 'undefined') {
			cmd.shift()
			entry[1](cmd)
		} else {
			display_output("'" + c + "' - command not found.")
		}
	}
}

$(function() {
	$('body').keypress(
		function(event) {
			if (event.keyCode == 13) {
				$('span#input').text().split(';').forEach(
					function(command) {
						execute(command.trim().split(' '))
					}
				)
				
				$('span#input').text('')
			} else {
				$('span#input').text($('span#input').text() + String.fromCharCode(event.charCode))
			}
			event.preventDefault()
			return false
		})
})
