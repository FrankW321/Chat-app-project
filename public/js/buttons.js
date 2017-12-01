var active_chat


// Send message
$('form').submit(function() {
	var message = $('#m').val()

	if (message.length === 0) {
		return false
	}

	if (active_chat) {
		var date = new Date(Date.now())
		$('#messages').append('<li><span class="message">'+ message +'</span><span class="message_timestamp">'+ date.getDate() +'/'+ (date.getMonth() + 1) +' '+ date.getHours() + ':' + date.getMinutes() +'</span></li>')
		//$('#messages').append($('<li>').text(message))
    	socket.emit('private message', {msg: message, recipient: active_chat})
    } else {
    	socket.emit('chat message', message)
    }
    $('#m').val('')
    return false
}) 


// Change active chat
$('aside li').on('click', function() {
	active_chat = $(this).children('.username').text()
	$('.chatting_with').text(active_chat)
	$('.active_chat').removeClass('active_chat')
	$(this).addClass('active_chat')
	$('aside li span:contains("'+ active_chat +'")').next().removeClass('last_message-unread')

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


// Toggle settings panel
$('#open_settings_panel').on('click', function(event) {
	event.stopPropagation()
	$('.friends_list_header .settings').toggle('fast')
})

// Stop event bubbling
$('.settings, .dropdown').on('click', function(event) {
	event.stopPropagation()
})


// Close dropdown, settings panel and search box when clicked outside
$(document).on('click', function() {
	$('.friends_list_header .dropdown').hide('fast')
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
	$('.settings input[name="username"]').prop('value', current_user.username)
	$('.settings input[name="email"]').prop('value', current_user.email)
	$('.settings input[name="new_password_1"]').prop('value', '')
	$('.settings input[name="new_password_2"]').prop('value', '')
	$('.settings input[name="password"]').prop('value', '')

	$('.friends_list_header .settings').hide('fast')
}


// Search box stuff
$('.add_box img').on('click', function() {
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