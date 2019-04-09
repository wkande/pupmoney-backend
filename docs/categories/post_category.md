

## POST /categories

Creates a new category within a wallet. A category name is unique within a wallet.

- Headers: JWT, Content-Type, wallet
- Body: name
- Parameters: none
- Query: none

##### Request
```javascript
server
.post('/categories')
.send({'name':'My new category'})
.set('wallet', wallet)
.set('Authorization', 'Bearer ' + token)
.set('Content-Type', 'application/x-www-form-urlencoded')
```

  

##### Response
```javascript
{
    "statusCode": 201,
    "statusMsg": "OK",
    "wallet_id": 1,
    "rowCount": 1,
    "category": {
        "id": 86,
        "wallet_id": 1,
        "name": "My new category",
        "dttm": "2018-12-31T07:00:00.000Z"
    }
}
```