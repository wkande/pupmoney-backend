

## GET /wallets
Returns a list of all wallets for a user including wallets shared with the user by other users. 

- Headers: JWT
- Body: none
- Parameters: none
- Query: none

##### Request
```javascript
server
.get('/wallets')
.set('Authorization', 'Bearer '  +  token)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "user_email": "warren@hotmail.com",
    "rowCount": 2,
    "wallets": [
        {
            "id": 1,
            "name": "Default Wallet",
            "owner_id": 1,
            "owner_name": "Warren Anderson",
            "owner_email": "warren@hotmail.com",
            "dttm": "2019-03-18T06:00:00.000Z",
            "default_wallet": 1,
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
            "shard": 2
        }
    ]
}

```