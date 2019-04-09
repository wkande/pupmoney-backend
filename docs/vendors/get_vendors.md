

## GET /categories/:cat_id/vendors
Returns a list of all vendors for a category. 

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.get('/categories/2/vendors')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "wallet_id": 1,
    "category_id": "2",
    "rowCount": 5,
    "vendors": [
        {
            "id": 1,
            "name": "Amazon"
        }...
    ]
}

```