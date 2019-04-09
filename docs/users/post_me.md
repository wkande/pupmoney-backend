
## POST /me
Creates a new user or returns an existing one if the user email address already exists. A code must have been sent prior to executing this endpoint and must be placed into the body. If the email address already exists 
the POST is ignored and the user's account is returned. This endpoint is used when logging in a user.  

- Headers: none
- Body: email, code
- Parameters: none
- Query: none

##### Request
```javascript
server

.post('/me')
.send({email:'wyosoft@hotmail.com', code:25510})
```

##### Response
```javascript
{
    {
    "statusCode": 200,
    "statusMsg": "OK",
    "user": {
        "id": 1,
        "email": "warren@hotmail.com",
        "name": "Warren Anderson",
        "member_since": "2019-03-18T06:00:00.000Z",
        "sub_expires": "2019-07-16T06:00:00.000Z",
        "sys_admin": 1,
        "wallets": [
            {
                "id": 1,
                "name": "Default Wallet",
                "owner_id": 1,
                "owner_name": "Warren Anderson",
                "owner_email": "warren@hotmail.com",
                "dttm": "2019-03-18T06:00:00.000Z",
                "default_wallet": 1,
                "country_code": "en-US",
                "currency_options": {
                    "style": "currency",
                    "currency": "USD",
                    "minimumFractionDigits": 2
                },
                "shard": 1
            },
            {
                "id": 2,
                "name": "Betsy's Wallet",
                "owner_id": 2,
                "owner_name": "Betsy Henderson",
                "owner_email": "betsy@hotmail.com",
                "dttm": "2019-03-18T06:00:00.000Z",
                "default_wallet": 1,
                "country_code": "en-US",
                "currency_options": {
                    "style": "currency",
                    "currency": "USD",
                    "minimumFractionDigits": 2
                },
                "shard": 2
            }
        ],
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXV..."
    }
}


```