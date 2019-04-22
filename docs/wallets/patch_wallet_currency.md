

## PATCH /wallet/:wallet_id/currency
Updates a wallet's currency percision. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded)
- Body: currency
- Parameters: wallet_id
- Query: none

##### Request
```javascript
server
.patch('/wallets/3')
.send({ 'currency':'{percision:"1.2-2"}'
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
        "shares": [
            2,
            4
        ],
        "name": "My new wallet name",
        "currency": {
            "percision": "1.2-2"
        },
        "default_wallet": 1,
        "dttm": "2019-01-01T07:00:00.000Z"
    }
}

```