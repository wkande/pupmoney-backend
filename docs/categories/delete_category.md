

## DELETE /categgories/:cat_id
Deletes a category from a wallet. All expenses associated with the category are also deleted. 

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.delete('/expenses/34')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "DELETED expense_id: 34",
    "rowCount": 1
}

```