

## POST /categories/:cat_id/vendors
Creates a new vendor in a category. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded), wallet
- Body: name
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.post('/categories/1/vendors')
.send({ 'name':'Food House'})
.set('Authorization', 'Bearer '  + token)
.set('wallet', wallet)
.set('Content-Type', 'application/x-www-form-urlencoded')
```

##### Response
```javascript
{
    "statusCode": 201,
    "statusMsg": "OK",
    "wallet_id": 1,
    "category_id": 1,
    "vendor": {
        "id": 23,
        "category_id": 1,
        "name": "Food House"
    }
}

```