

## PATCH /categories/:cat_id/vendors/:vendor_id
Updates a vendor. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded), wallet
- Body: name
- Parameters: cat_id, vendor_id
- Query: none

##### Request
```javascript
server
.patch('/expenses/1/vendors/67')
.send({ 'name':'Dennys Diner}'})
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
.set('Content-Type', 'application/x-www-form-urlencoded'
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "wallet_id": 1,
    "category_id": "1",
    "vendor": {
        "id": 67,
        "category_id": 1,
        "name": "Dennys Diner"
    }
}

```