

## GET /categories/:cat_id
Returns a single category.

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.get('/categories/34')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "wallet_id": 1,
    "transactionCnt": "307",
    "category": {
        "id": 34,
        "wallet_id": 1,
        "name": "Groceries",
        "dttm": "2019-03-19T06:00:00.000Z"
    }
}

```