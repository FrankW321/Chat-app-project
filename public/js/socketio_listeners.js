const socket = io()

socket.on('connect', () => {
	socket.emit('connected', {id: socket.id, username: current_user.username})
    socket.emit('join', {username: current_user.username})
})

socket.on('disconnect', function() {
	alert('Server is not responding')
}) 


// Receive general messages
socket.on('chat message', function(data) {
    var date = new Date(data.date)
    $('#messages').append('<li><span class="message">'+ data.msg +'</span><span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></li>')
})


// Receive private messages
socket.on('private message', function(data) {
	var date = new Date(data.date)
	if (data.from == active_chat) {
    	// $('#messages').append($('<li>').text(data.msg))
    	$('#messages').append('<li><span class="message">'+ data.msg +'</span><span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></li>')
    } else {
    	$('aside li span:contains("'+ data.from +'")').next().addClass('last_message-unread')
    }

    var length = data.msg.length
    if (length > 18) {
    	data.msg = data.msg.slice(0,-(length-18)) + '...'
    }

    $('aside li span:contains("'+ data.from +'")').next().text(data.msg)
})


// Receive feedback upon changing settings
socket.on('feedback', function(data) {
	let feedback_message_el = $('.feedback_message')

	if(data.failure) {
		feedback_message_el.addClass('feedback_message_red')

		if(data.feedback == 'error') {
			feedback_message_el.text('Updating settings failed, please try relogging and updating the settings again')
		} else {
			feedback_message_el.text(data.feedback)
		}
	} else {
		feedback_message_el.addClass('feedback_message_green')
		feedback_message_el.text(data.feedback)
	}

	$('#save_settings').removeClass('feedback_save_button')
	feedback_message_el.show('fast')
})


// Receive search results
socket.on('search_results', function(results) {
	$('.search_results ul').empty()

	$.each( results, function( i, value) {
		$('.search_results ul').append('<li>'+ value +'</li>')
	})
})