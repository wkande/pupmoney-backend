

## DELETE /categories/:exp_id
Deletes a category from a wallet after all associated expenses have been moved to another catgegory. 

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.delete('/expenses/34/22')
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