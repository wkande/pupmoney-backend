

## GET /categories/:cat_id/expenses
Returns a list of all expenses from a category for the time period passed (dttmStart-dttmEnd) and the text search (q) which can be null, all three required.  The optional query parameter skip is used for pagination. Each endpoint call returns 50 rows as a limit, use skip to jump forward by setting a start point.

- Headers: JWT, wallet
- Body: none
- Parameters: cat_id
- Query: q, dttmStart, dttmEnd, skip

##### Request
```javascript
server
.get('/categories/33/expenses/?q=&dttmStart=2010-01-23&dttmEnd=2020-12-12&skip=50')
.set('Authorization', 'Bearer '  +  token)
.set('wallet', wallet)
```

##### Response
The reponse will return a maximum of 50 rows. Use skip to get additional rows by defining a start point in the result set.
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "user_id": 1,
    "wallet_id": 1,
    "category_id": "2",
    "rowCount": 50,
    "totalCount": 307,
    "expenses": [
        {
            "id": 5707,
            "category_id": 2,
            "wallet_id": 1,
            "document": "'1.86':15 'car':11 'wax':4",
            "amt": 1.86,
            "dttm": "2019-03-14",
            "note": "Car wax",
            "vendor": "Target"
        }...
    ]
}
```