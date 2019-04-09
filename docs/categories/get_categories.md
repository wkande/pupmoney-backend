

## GET /categories
Returns a list of all categories from a user wallet. Attached is a array where each category has a summary of expense amounts for the time period passed (dttmStart-dttmEnd) and the text search (q) which can be null. All three query parameters are required.

- Headers: JWT, wallet
- Body: none
- Parameters: none
- Query: q, dttmStart, dttmEnd

##### Request
```javascript
server
.get('/categories')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

 
##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "user_email": "warren@hotmail.com",
    "wallet_id": 1,
    "rowCount": 20,
    "dttmStart": "2017-01-02",
    "dttmEnd": "2020-01-02",
    "categories": [
        {
            "id": 13,
            "wallet_id": 1,
            "name": "Beauty",
            "dttm": "2019-03-19T06:00:00.000Z",
            "sum": {
                "amt": 691.16,
                "cnt": 129
            }
        }...
    ]
}
```
The sum obj from each category contains the amt (sum total) and cnt (transactions) for the entered expenses during the time period sent (dttStart-dttmEnd) and considering the text search (q).