

## DELETE /categroies/:cat_id/expenses/:exp_id
Deletes an expense.

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id, exp_id
- Query: none

##### Request
```javascript
server
.get('/categroies/33/expenses/4234')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "DELETED expense_item_id: 33",
    "rowCount": 1
}
```
