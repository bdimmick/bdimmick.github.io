execute_on = true

deny_cat = ["index.js"]

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
		output = $('div#output').text() + output +"\n"
	}
	$('div#output').text(output)
}

function cat_fail(f) {
	display_output("cat: " + f + ": No such file or directory", true)
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
				display_output(pad_to(k, maxlen) + " - " + commands[k][0], true)
			})
		}
	],
	'cat': [
		"Prints a file.",
		function(params) { 
			params.forEach(function(f) {
				f = f.toLowerCase()
				if (deny_cat.includes(f)) {
					cat_fail(f)
				} else {
					$.get('/' + f, function(data) { display_output(data, true) }).fail( function() {  cat_fail(f) })
				}
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
