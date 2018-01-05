var active_chat


// Send message
$('form').submit(function() {
	var message = $('#m').val()

	if (message.length === 0) {
		return false
	}

	if (active_chat) {
		var date = Date.now()
		var timestamp = format_timestamp(date)
		var previous_el = $('#messages li').last()
    	var previous_timestamp = previous_el.find('.message_timestamp').data('timestamp')

		if (date - previous_timestamp <= 30000 && previous_el.hasClass('sent')) {

			if (previous_el.hasClass('connected_up')) {
				previous_el.removeClass('connected_up')
				previous_el.addClass('connected')	
			} else {
				previous_el.addClass('connected_down')
			}

			new_content ='<li class="sent connected_up"><span class="message">'+ message +'<span class="message_timestamp" data-timestamp="'+ date +'">'+ timestamp +'</span></span></li>'
		} else {
    		new_content ='<li class="sent"><span class="message">'+ message +'<span class="message_timestamp" data-timestamp="'+ date +'">'+ timestamp +'</span></span></li>'
    	}

    	$('#messages').append(new_content)

    	socket.emit('private_message', {msg: message, chat_id: active_chat.chat_id, recipient_id: active_chat.recipient_id})
    	$('.friends_list li[data-id="'+ active_chat.recipient_id +'"]').children('.last_message').text('You: '+ message)
    } else {
    	var timestamp = Date.now()
    	$('#messages').append('<li class="sent"><span class="message">'+ message +'<span class="message_timestamp">'+ format_timestamp(timestamp) +'</span></span></li>')
    	socket.emit('chat_message', {msg: message, from: user.id})
    }
	$('#messages').scrollTop($('#messages').prop('scrollHeight'))
    $('#m').val('')
    return false
}) 


// Change active chat
function friend_list_click_handler() {
	$('aside li').off()

	$('aside li').on('click', function() {
		first_run = true
		var active_chat_username = $(this).children('.username').text()
		active_chat = {
			chat_id: $(this).data('chatId'),
			recipient_id: $(this).data('id')
		}

		//history.pushState(null, null, active_chat)
		$('.chatting_with').text(active_chat_username)
		$('.active_chat').removeClass('active_chat')
		$(this).addClass('active_chat')
		$('aside li[data-chat-id="'+ active_chat.chat_id +'"]').children('.last_message').removeClass('last_message-unread')

		socket.emit('retrieve_messages', {chat_id: active_chat.chat_id})

		$('#m').focus()
		//socket.emit('leave', {username: '<$= username $>'})
		$('#messages').empty()
	  	//socket.emit('join', {username: active_chat})
	})
}

friend_list_click_handler()


// Toggle dropdown
$('.friends_list_header .dropdown_link').on('click', function(event) {
	event.stopPropagation()

	if ($('.friends_list_header .settings').is(':visible')) {
		$('.friends_list_header .settings').hide('fast')
	}

	$('.friends_list_header .dropdown').toggle('fast')
})


// Toggle notification panel
$('#open_notification_panel').on('click', function(event) {
	event.stopPropagation()
	$('.friends_list_header .settings').hide('fast')
	$('.friends_list_header .notifications').toggle('fast')
})

// Toggle settings panel
$('#open_settings_panel').on('click', function(event) {
	event.stopPropagation()
	$('.friends_list_header .notifications').hide('fast')
	$('.friends_list_header .settings').toggle('fast')
})

// Stop event bubbling
$('.settings, .dropdown').on('click', function(event) {
	event.stopPropagation()
})


// Close dropdown, settings panel, notification panel and search box when clicked outside
$(document).on('click', function() {
	$('.friends_list_header .dropdown').hide('fast')
	$('.friends_list_header .notifications').hide('fast')
	$('.search_results ul').empty()
	$('.add_box input').prop('value', '')
	$('.add_box').removeClass('add_box_shown')
	discard_settings()
})


// Save settings
$('#save_settings').on('click', function(event) {
	$('.feedback_message').hide('fast').removeClass('feedback_message_green feedback_message_red')
	$('#save_settings').addClass('feedback_save_button')
	socket.emit('update_user_data', {
		username: $('.settings input[name="username"]').prop('value'),
		email: $('.settings input[name="email"]').prop('value'),
		new_password_1: $('.settings input[name="new_password_1"]').prop('value'),
		new_password_2: $('.settings input[name="new_password_2"]').prop('value'),
		password: $('.settings input[name="password"]').prop('value')
	})
})

$('#discard_settings').on('click', function() {
	discard_settings()
})

function discard_settings() {
	$('.settings input[name="username"]').prop('value', user.username)
	$('.settings input[name="email"]').prop('value', user.email)
	$('.settings input[name="new_password_1"]').prop('value', '')
	$('.settings input[name="new_password_2"]').prop('value', '')
	$('.settings input[name="password"]').prop('value', '')

	$('.friends_list_header .settings').hide('fast')
}


// Search box stuff
$('.add_box img').on('click', function(event) {
	event.stopPropagation()
	$('.add_box').toggleClass('add_box_shown')
	$('.add_box input').focus()
})

$('.add_box input').on('click', function(event) {
	event.stopPropagation()
})

$('.add_box input').on('keyup', function() {
	const value = $(this).prop('value')

	if(value !== '') {
		socket.emit('search_users', value)
	} else {
		$('.search_results ul').empty()
	}
})


// Send friend request
function attach_click_handlers() {
	$('.search_results li:not(:has(button))').on('click', function(event) {
		event.stopPropagation()
		const user_id = $(this).data('id')
		$('aside li[data-id="'+ user_id +'"]').click()
	})

	$('.search_results li button').on('click', function(event) {
		event.stopPropagation()
		$(this).append('<div class="loading_div"></div>')
		console.log($(this).parent().data('id'))
		socket.emit('friend_request', {id: $(this).parent().data('id'), username: $(this).parent().text()} )
	})
}


function attach_friend_request_click_handlers() {
	$('.notifications .accept_request, .notifications .decline_request').off()

	// Accept friend request
	$('.notifications .accept_request').on('click', function(event) {
		event.stopPropagation()
		$(this).parent().append('<div class="loading_div"></div>')
		socket.emit('accept_friend_request', {id: $(this).parents('li').first().data('id'), username: $(this).parents('li').first().text()} )
	})

	// Decline friend request
	$('.notifications .decline_request').on('click', function(event) {
		event.stopPropagation()
		$(this).parent().append('<div class="loading_div"></div>')
		socket.emit('decline_friend_request', $(this).parents('li').first().data('id') )
	})
}

attach_friend_request_click_handlers()

var lock
$('#messages').on('scroll', function() {
	if ( $('#messages').prop('scrollTop') < 300 && !lock) {
		lock = true
		$('#messages').prepend('<li class="loading"><div class="loading_div"></div></li>')
		socket.emit('retrieve_messages', {chat_id: active_chat.chat_id, last_timestamp: last_timestamp})
	}
})