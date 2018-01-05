const socket = io()
let last_timestamp

socket.on('connect', () => {
	socket.emit('connected', {id: user.id, username: user.username})
    socket.emit('join', {username: user.username})
})

socket.on('disconnect', function() {
	//alert('Server is not responding')
})


// Receive general messages
socket.on('chat_message', function(data) {
	if (data.from != user.id) {
    	var timestamp = format_timestamp(data.date)
    	$('#messages').append('<li><span class="message">'+ data.msg +'<span class="message_timestamp">'+ timestamp +'</span></span></li>')
    }
	var true_el_height = $('#messages')[0].scrollHeight
	var el_height = $('#messages').height()
	var pos_from_bottom = true_el_height - el_height - $('#messages').prop('scrollTop')

	if (pos_from_bottom < 400) {
		$('#messages').scrollTop($('#messages').prop('scrollHeight'))
	}
})


// Receive private messages
socket.on('private_message', function(data) {
	var timestamp = format_timestamp(data.date)
	if (active_chat && data.from == active_chat.recipient_id) {
    	var previous_el = $('#messages li').last()
    	var previous_timestamp = previous_el.find('.message_timestamp').data('timestamp')

    	if (data.date - previous_timestamp <= 30000 && !previous_el.hasClass('sent')) {

			if (previous_el.hasClass('connected_up')) {
				previous_el.removeClass('connected_up')
				previous_el.addClass('connected')	
			} else {
				previous_el.addClass('connected_down')
			}

			new_content ='<li class="connected_up"><span class="message">'+ data.msg +'<span class="message_timestamp" data-timestamp="'+ data.date +'">'+ timestamp +'</span></span></li>'
		} else {
    		new_content ='<li><span class="message">'+ data.msg +'<span class="message_timestamp" data-timestamp="'+ data.date +'">'+ timestamp +'</span></span></li>'
    	}

    	$('#messages').append(new_content)


		var true_el_height = $('#messages')[0].scrollHeight
		var el_height = $('#messages').height()
		var pos_from_bottom = true_el_height - el_height - $('#messages').prop('scrollTop')

		if (pos_from_bottom < 400) {
			$('#messages').scrollTop($('#messages').prop('scrollHeight'))
		}
    } else {
    	$('.friends_list li[data-id="'+ data.from +'"]').next().addClass('last_message-unread')
    }

    var length = data.msg.length
    if (length > 18) {
    	data.msg = data.msg.slice(0,-(length-18)) + '...'
    }

    $('.friends_list li[data-id="'+ data.from +'"]').children('.last_message').text(data.msg)
})

// Receive message history

var first_run = true

socket.on('retrieve_messages', function(messages) {
	messages = JSON.parse(messages)
	var timestamp

	$('#messages .loading').remove()

	if (messages.length == 0) {
		lock = true
		return
	}

	last_timestamp = messages[messages.length-1].date

	for (var i = 0; i < messages.length; i++) {
		timestamp = format_timestamp(messages[i].date)
		
		if (messages[i].from == user.id) {
			append_message('sent')
		} else {
			append_message('')
		}
	}

	var true_el_height = $('#messages')[0].scrollHeight
	var el_height = $('#messages').height()
	var pos_from_bottom = true_el_height - el_height - $('#messages').prop('scrollTop')

	if (first_run || (!lock && pos_from_bottom < 400)) {
		first_run = false
		$('#messages').scrollTop($('#messages').prop('scrollHeight'))
	}

	lock = false

	function append_message(classes) {
		var new_content

		if (i > 0 && messages[i].date - messages[i-1].date <= 30000 && messages[i].from == messages[i-1].from) {
			if (i != (messages.length - 1) && messages[i+1].date - messages[i].date <= 30000 && messages[i].from == messages[i+1].from) {
				new_content ='<li class="connected '+ classes +'"><span class="message">'+ messages[i].msg +'<span class="message_timestamp" data-timestamp="'+ messages[i].date +'">'+ timestamp +'</span></span></li>'
			} else {
				new_content ='<li class="connected_down '+ classes +'"><span class="message">'+ messages[i].msg +'<span class="message_timestamp" data-timestamp="'+ messages[i].date +'">'+ timestamp +'</span></span></li>'
			}
		} else if (i < messages.length && i != (messages.length - 1) && messages[i+1].date - messages[i].date <= 30000 && messages[i].from == messages[i+1].from) {
			new_content ='<li class="connected_up '+ classes +'"><span class="message">'+ messages[i].msg +'<span class="message_timestamp" data-timestamp="'+ messages[i].date +'">'+ timestamp +'</span></span></li>'
		} else {
    		new_content ='<li class="'+ classes +'"><span class="message">'+ messages[i].msg +'<span class="message_timestamp" data-timestamp="'+ messages[i].date +'">'+ timestamp +'</span></span></li>'
    	}

    	$('#messages').prepend(new_content)
	}
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


// Receive friend request
socket.on('friend_request', function(from) {
	$('.notifications ul').append('<li data-id="'+ from.id +'">'+ from.username +'<div><div><img src="images/ic_person_add_white_24px.svg" class="accept_request" alt="accept friend request"></div><div><img src="images/ic_remove_circle_white_24px.svg" class="decline_request" alt="decline friend request"></div></div></li>')

	var notification_count_el = $('.notification_count')

	if (notification_count_el.length > 0) {
		var count = parseInt(notification_count_el.text())
		count++
		notification_count_el.text(count)
	} else {
		$('.dropdown_link').append('<span class="notification_count">1</span>')
	}

	attach_friend_request_click_handlers()
})


//
socket.on('new_friend', function(friend) {
	$('.friends_list').prepend('<li data-id="'+ friend.id +'" data-chat-id="'+ friend.chat +'">'+
		'<img src="http://via.placeholder.com/50/CCCCCC/000000?text='+ friend.username.charAt(0) +'">'+
		'<span class="username">'+ friend.username +'</span>'+
		'<span class="last_message">Friend request accepted</span>'+
	'</li>')

	$('#guide_1, #guide_2').remove()

	friend_list_click_handler()
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


function format_timestamp(unix_epoch) {
	var date = new Date(unix_epoch)

	var day = date.getDate()
	var month = date.getMonth() + 1
	var hour = date.getHours()
	var minutes = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes()
	//var seconds = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds()

	return day + '/' + month + ' ' + hour + ':' + minutes// + ':' + seconds
}