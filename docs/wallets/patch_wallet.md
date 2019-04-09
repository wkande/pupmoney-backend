

## PATCH /wallet/:wallet_idid
Updates a wallet. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded)
- Body: name, shares, country_code, currency_options
- Parameters: wallet_id
- Query: none

##### Request
```javascript
server
.patch('/wallets/3')
.send({ 'name':'My new wallet name',
        'shares':'{1,2,4}',
        'country_code':'it-IT',
        'currency_options':'{"style": "currency", "currency": "EUR", "minimumFractionDigits": 2}'
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
        "default_wallet": 1,
        "dttm": "2019-01-01T07:00:00.000Z"
    }
}

```