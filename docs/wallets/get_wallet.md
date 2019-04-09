

## GET /wallet/:wallet_id
Returns a single wallet belonging to the user described by the JWT token. Will not return shared wallets.

- Headers: JWT
- Body: none
- Parameters: wallet_id
- Query: none

##### Request
```javascript
server
.get('/wallets/1')
.set('Authorization', 'Bearer '  +  global.token)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "user_email": "warren@hotmail.com",
    "wallet": {
        "id": 1,
        "name": "Default Wallet",
        "shares": [],
        "shard": 1,
        "default_wallet": 1,
        "dttm": "2019-03-18T06:00:00.000Z",
        "owner_id": 1,
        "owner_name": "Warren Anderson",
        "owner_email": "warren@hotmail.com"
    }
}

```