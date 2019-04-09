

## DELETE /wallet/:wallet_id
Deletes a wallet. 

- Headers: JWT
- Body: none
- Parameters: wallet_id
- Query: none

##### Request
```javascript
server

.delete('/wallets/3')
.set('Authorization', 'Bearer '  +  token)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "DELETED wallet_id: 9",
    "rowCount": 1
}

```