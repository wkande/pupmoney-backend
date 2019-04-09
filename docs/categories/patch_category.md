

## PATCH /categories/:cat_id/name
Updates the category name. 

- Headers: JWT, Content-Type, wallet
- Body: name
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.patch('/categories/34/name')
.send({'name':'Auto'})
.set('wallet', wallet)
.set('Authorization', 'Bearer '  +  token)
.set('Content-Type', 'application/x-www-form-urlencoded')
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "wallet_id": "1",
    "rowCount": 1,
    "category": {
        "id": 34,
        "wallet_id": 1,
        "name": "Auto",
        "vendors":["Amazon", "Walmart"],
        "dttm": "2018-12-31T07:00:00.000Z"
    }
}

```