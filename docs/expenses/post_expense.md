

## POST /categories/:cat_id/expenses
Creates a new expense for a category. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded), wallet
- Body: note, vendor, amt, dttm
- Parameters: cat_id
- Query: none

##### Request
```javascript
server
.post('/categories/33/expenses')
.send('note':'Batteries AAA', 'vendor':'K-Mart', 'amt':7.90, dttm:'2014-02-01'})
.set('wallet', wallet)
.set('Authorization', 'Bearer '  +  token)
.set('Content-Type', 'application/x-www-form-urlencoded')
```

##### Response
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "wallet_id": "1",
    "rowCount": 1,
    "expense": {
        "id": 6000,
        "expense_id": 20,
        "vendor": K-Mart,
        "note": "Batteries AAA",
        "amt": "7.90",
        "dttm": "2017-11-16T07:00:00.000Z",
        "date": "Nov-16-2017"
    }
}
```