

## PATCH /user/name
Changes a user's name. Uses keys within the JWT to access the user object. A new JWT token and user object are returned.

- Headers: JWT
- Body: name
- Parameters: none
- Query: none

##### Request
```javascript
server
.patch('/user/name')
.set('Authorization', 'Bearer '  +  token)
.send({'name':name})
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user": {
        "id": 1,
        "email": "warren@hotmail.com",
        "sys_admin": 1,
        "sub_expires": "2019-07-16T06:00:00.000Z",
        "member_since": "2019-03-18T06:00:00.000Z",
        "name": "Warren Anderson",
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
                "name": "Betsy Wallet",
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