

## GET /categories/:cat_id/expenses/:exp_id
Returns a single expense. 

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id, exp_id
- Query: none

##### Request
```javascript
server
.get('/categories/34/expenses/45646')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "wallet_id": "1",
    "item": {
        "id": 45646,
        "category_id": 34,
        "vendor": "Albertsons",
        "note": "Food for birthday party",
        "amt": "3.6800",
        "dttm": "2017-11-16T07:00:00.000Z",
        "date": "Nov-16-2017"
    }
}

```

The amt is recorded with 4 decimals. User preferences determine how many decimals are effectivily used.