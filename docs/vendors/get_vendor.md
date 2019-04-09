

## GET /catgories/:cat_id/vendors/:vendor_id
Returns a single vendor. Vendors are unique to a category.

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id, vendor_id
- Query: none

##### Request
```javascript
server
.get('/categories/2/vendors67/')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "wallet_id": 1,
    "category_id": "1",
    "vendor": {
        "id": 1,
        "name": "Amazon"
    }
}

```