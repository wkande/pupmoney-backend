


## DELETE /categories/:cat_id/vendors/:vendor_id
Deletes a vendor. 

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id, vendor_id
- Query: none

##### Request
```javascript
server
.delete('/categories/2/vendors/67')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "DELETED vendor_id: 67",
    "rowCount": 1
}

```