

## POST /wallets
Creates a new wallet. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded)
- Body: name, shares, country_code, currency_options
- Parameters: none
- Query: none

shares: are the user_ids of those that the wallet is to be shared with if any. 


##### Request
```javascript
server
.post('/wallets')
.send({ 'name':'My new wallet',
        'shares':'{1,2,4}',
        'country_code':'en-US',
        'currency_options':'{"style": "currency", "currency": "USD", "minimumFractionDigits": 2}'
})
.set('Authorization', 'Bearer '  + token)
.set('Content-Type', 'application/x-www-form-urlencoded')
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
            3,
            2
        ],
        "name": "My new wallet name",
        "default_wallet": 1,
        "dttm": "2019-01-01T07:00:00.000Z"
    }
}

```