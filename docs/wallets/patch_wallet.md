

## PATCH /wallet/:wallet_id
Updates a wallet's name and shares. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded)
- Body: name, shares
- Parameters: wallet_id
- Query: none

##### Request
```javascript
server
.patch('/wallets/3')
.send({ 'name':'My new wallet name',
        'shares':'{1,2,4}'
})
.set('Authorization', 'Bearer '  +  global.token)
.set('Content-Type', 'application/x-www-form-urlencoded'
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "rowCount": 1,
    "wallet": {
        "id": 1,
        "user_id": 1,
        "shard": 2,
        "shares": [1,2,4],
        "name": "My new wallet name",
        "default_wallet": 1,
        "dttm": "2019-04-08T06:00:00.000Z",
        "currency": {
            "curId": 2,
            "symbol": "",
            "decimal": ".",
            "precision": 2,
            "separator": ","
        }
    }
}

```