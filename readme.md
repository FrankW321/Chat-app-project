# Codeline_

Instant messaging app [for developers]


## Setup instructions
### Prerequisites

* Working node, npm and mongodb installation

* Application server tested on Debian Linux 9
* Application client(browser) tested on Google Chrome for Linux 63
* App will look different and might not work on other browsers
* Optimal screen resolution 1920x1080, browser window maximized


### Commands

1. git clone [git URL]

2. cd [dir]

3. npm install

4. npm start


## Functionalities

* Registering
* Logging in
* Logging out
* Changing account credentials like username, email and password
* Sending friend requests
* Friend request notifications
* Accepting or declining friend requests
* Sending private messages to friends
* Message history with infinite scroll
* Hovering over a message shows timestamp
* "Related" messages are grouped closer together


## To-do list
* ~~Friends~~
* Deleting your account
* Email verification
* Blocking users
* Removing friends
* Groups
* File/image sharing
* Code snippets' sharing - syntax highlighting
* Emojis



## How to use

1. Register an account by clicking on the register button and filling out the fields, email is required, but not used anywhere yet

2. Register another account in incognito window

3. When logged in, click on the plus icon in the down left corner

4. Start typing the username of the other account, when it appears click on the plus icon next to it

5. If it was successful it should say "Friend request pending"

6. Now switch to the other window and it should show a little number 1 in the top left corner, that indicates the number of notifications

7. Click on the number, click on notifications from the menu, and now click on either the plus or minus icon to accept or decline respectively

8. Now click anywhere outside the menu to close it, the contact should now be listed in the left sidebar

9. Click on it to start a conversation, type a message in the textbox that has placeholder text "Type your message here..." and press enter or click the send button to send it

10. The message should appear in the center column

11. It doesn't show the message on the other window yet, because the conversation isn't active, but you can see the last message in the left sidebar

12. Click on your name or image next to it to open the menu, click on settings, there you can change your account credentials.