

## POST /code
A code is used for authentication and changing an email address. PupMoney is 
a passwordless app that piggy-backs on the user's email account. When logging into PupMoney the user must enter their email address upon which a code is sent to the email address. Tha code must then be entered into the login view.

Sends a new code to the email address in the body. For development and stage ervers the code is also included in the response.

 - Headers: Content-Type (application/x-www-form-urlencoded) 
 - Body: email
 - Parameters: none
 - Query: none

##### Request
```javascript
server
.post('/codes')
.send({email:'wyosoft@hotmail.com'})
```

##### Response
```javascript
// Production Server
{
    "statusCode": 201,
    "statusMsg": "Created",
    "data": {
        "email": "warren@wyoming.cc",
        "code": "sent via email"
    }
}
// Developement Server
{
    "statusCode": 201,
    "statusMsg": "Created",
    "data": {
        "email": "warren@wyoming.cc",
        "code": 25510
    }
}
```