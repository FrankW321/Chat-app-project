var active_chat


// Send message
$('form').submit(function() {
	var message = $('#m').val()

	if (message.length === 0) {
		return false
	}

	if (active_chat) {
		var date = new Date(Date.now())
		$('#messages').append('<li class="sent"><span class="message">'+ message +'<span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></span></li>')
		//$('#messages').append($('<li>').text(message))
    	socket.emit('private message', {msg: message, recipient_id: active_chat})
    } else {
    	socket.emit('chat message', message)
    }
    $('#m').val('')
    return false
}) 


// Change active chat
$('aside li').on('click', function() {
	var active_chat_username = $(this).children('.username').text()
	active_chat = $(this).data('id')
	//history.pushState(null, null, active_chat)
	$('.chatting_with').text(active_chat_username)
	$('.active_chat').removeClass('active_chat')
	$(this).addClass('active_chat')
	$('aside li[data-id="'+ active_chat +'"]').children('.last_message').removeClass('last_message-unread')

	$('#m').focus()
	//socket.emit('leave', {username: '<$= username $>'})
	$('#messages').empty()
  	//socket.emit('join', {username: active_chat})
})


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
		socket.emit('friend_request', $(this).parent().data('id') )
	})
}


// Accept friend request
$('.notifications .accept_request').on('click', function(event) {
	event.stopPropagation()
	$(this).parent().append('<div class="loading_div"></div>')
	socket.emit('accept_friend_request', $(this).parents('li').first().data('id') )
})

// Decline friend request
$('.notifications .decline_request').on('click', function(event) {
	event.stopPropagation()
	$(this).parent().append('<div class="loading_div"></div>')
	socket.emit('decline_friend_request', $(this).parents('li').first().data('id') )
})