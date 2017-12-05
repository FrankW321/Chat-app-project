const socket = io()

socket.on('connect', () => {
	socket.emit('connected', {id: user.id, username: user.username})
    socket.emit('join', {username: user.username})
})

socket.on('disconnect', function() {
	alert('Server is not responding')
}) 


// Receive general messages
socket.on('chat message', function(data) {
    var date = new Date(data.date)
    $('#messages').append('<li><span class="message">'+ data.msg +'<span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></span></li>')
})


// Receive private messages
socket.on('private message', function(data) {
	var date = new Date(data.date)
	if (data.from == active_chat) {
    	// $('#messages').append($('<li>').text(data.msg))
    	$('#messages').append('<li><span class="message">'+ data.msg +'<span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></span></li>')
    } else {
    	$('.friends_list li[data-id="'+ data.from +'"]').next().addClass('last_message-unread')
    }

    var length = data.msg.length
    if (length > 18) {
    	data.msg = data.msg.slice(0,-(length-18)) + '...'
    }

    $('.friends_list li[data-id="'+ data.from +'"]').children('.last_message').text(data.msg)
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


// Receive feedback upon sending friend request
socket.on('friend_request_feedback', function(data) {
	if (data.nModified === 1) {
		$('.search_results li[data-id="'+ data.recipient_id +'"]').find('button').remove()
		$('.search_results li[data-id="'+ data.recipient_id +'"]').append('<span>Friend request pending</span>')
		$('.notifications li[data-id="'+ data.recipient_id +'"]').remove()

		var notification_count_el = $('.notification_count')

		if ( notification_count_el.text() === '1') {
			notification_count_el.remove()
		} else {
			var count = parseInt(notification_count_el.text())
			count--
			notification_count_el.text(count)
		}
	} else {
		$('.search_results li[data-id="'+ data.recipient_id +'"]').find('.loading_div').remove()
	}
})


// Receive search results
socket.on('search_results', function(results) {
	$('.search_results ul').empty()

	$.each( results, function( i, obj) {
		if (is_value_in_object(user.friends, obj) == -1) {
			if (is_value_in_object(user.sent_friend_requests, obj) == -1) {
				$('.search_results ul').append('<li data-id='+ obj.id +'>'+ obj.username +'<button><img src="images/ic_person_add_white_24px.svg" alt="Send friend request"></button></li>')
			} else if (is_value_in_object(user.received_friend_requests, obj) == -1) {
				$('.search_results ul').append('<li data-id='+ obj.id +'>'+ obj.username +'<span>Friend request pending</span></li>')
			} else {

			}
		} else {
			$('.search_results ul').append('<li data-id='+ obj.id +'>'+ obj.username +'</li>')
		}
	})

	function is_value_in_object(array, object) {
		return array.findIndex(function(obj) {
			return obj.id == object.id 
		})
	}

	attach_click_handlers()
})