

## GET /admin/users
Returns all users using an offset. This endpoint is protected by the admin function in the security module.

- Headers: JWT
- Body: none
- Parameters: none
- Query: offset

##### Request
```javascript
server
.get('/admin/users?offset=0')
.set('Authorization', 'Bearer '  +  token)
```

##### Response
The reponse will return a maximum of 50 rows. Use offset to get additional rows starting with offset 50, then 100 etc.
```javascript
{
    "statusCode": 200,
    "statusMsg": "OK",
    "offset": 0,
    "rowCount": 4,
    "users": [
        {
            "id": 2,
            "email": "betsy@wyoming.cc",
            "name": "Betsy Anderson",
            "member_since": "2019-02-04T07:00:00.000Z",
            "sub_expires": "2019-06-04T06:00:00.000Z",
            "sys_admin": 0
        },
        {
            "id": 3,
            "email": "test_user_3@noaddresshere.com",
            "name": "TestUser_3",
            "member_since": "2019-02-04T07:00:00.000Z",
            "sub_expires": "2019-06-04T06:00:00.000Z",
            "sys_admin": 0
        },
        {
            "id": 4,
            "email": "test_user_4@noaddresshere.com",
            "name": "TestUser_4",
            "member_since": "2019-02-04T07:00:00.000Z",
            "sub_expires": "2019-06-04T06:00:00.000Z",
            "sys_admin": 0
        },
        {
            "id": 1,
            "email": "warren@wyoming.cc",
            "name": "Warren Anderson",
            "member_since": "2019-02-04T07:00:00.000Z",
            "sub_expires": "2019-06-04T06:00:00.000Z",
            "sys_admin": 1
        }
    ]
}
```