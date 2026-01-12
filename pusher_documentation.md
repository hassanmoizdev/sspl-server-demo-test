Pusher Notifications Documentation
This document provides details for integrating the Pusher notification system into the mobile application.

1. Server Configuration
   The server uses Pusher for real-time notifications. Ensure you have the Pusher App Key and Cluster provided by the backend team.

2. Authentication & Authorization Endpoints
   Mobile clients must authenticate with the server to connect to private channels.

User Authentication
Used to authenticate the user's connection to Pusher.

URL: /pusher/user-auth
Method: POST
Auth: Required (Bearer Token)
Body:
{
"socket_id": "STRING_FROM_PUSHER_SDK"
}
Response: Standard Pusher auth object.
Channel Authorization
Used to authorize access to specific private channels.

URL: /pusher/auth
Method: POST
Auth: Required (Bearer Token)
Body:
{
"socket_id": "STRING_FROM_PUSHER_SDK",
"channel_name": "private-general"
}
Response: Standard Pusher auth object. 3. Channels and Events
General Notifications
Channel: private-general
Events:
new-conference: Triggered when a new conference is created.
Payload:
{
"id": number,
"title": "string",
"start_date": "ISO_DATE_STRING"
}
