

## PUT /categories/:cat_id/expenses/:exp_id
Updates an expense for a category. The expense can move to an different category. 

- Headers: JWT, Content-Type (application/x-www-form-urlencoded), wallet
- Body: cat_id, note, vendor, amt, dttm
- Parameters: cat_id, exp_id
- Query: none

The cat_id (if present) in the body is the category that the expesne will be moved to. Omit if no move is required.

##### Request
```javascript
server
.put('/categories/33/expenses/345345')
.send({'cat_id':cat_id, 'note':'Furnance filters', 'vendor':'Amazon','amt':9.9500, dttm:'2018-01-02'})
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
    "wallet_id": 1,
    "org_category_id": "19",
    "category_id": "20",
    "rowCount": 1,
    "expense": {
        "id": 42602,
        "category_id": 20,
        "vendor": "Amazon",
        "note": "Furnance filters",
        "image_ref": null,
        "imported": null,
        "amt": "9.9500",
        "dttm": "2018-01-02T07:00:00.000Z"
    }
}
```