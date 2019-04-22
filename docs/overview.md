# API Endpoints Overview 

PupMoney is a Nodejs backend and PostgreSQl database.

PupMoney is built with Nodejs, Express, PostgreSQL and Ionic.

PupMoney uses Express routers. This allows for better organization of the files that make up the routes.  






## Security

Endpoints are protected using a passwordless scheme. To use the endpoints a code must be acquired prior to accessing the GET /user endpoint which returns a JWT token. The token must be used on subsequent calls to get data.




  
## Unit Tests

Tests for all endpoints are written with Mocha, Supertest and Should.

```javascript
"devDependencies": {
    "mocha": "^6.0.2",
    "should": "^13.2.3",
    "supertest": "^3.3.0"
  }
```

By default the TESTS are run against a localhost URL which is set at the top of each file in the test directory.
``` javascript
// From the test file 01_users.js
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
```

To run against a different DEV or STAGE url export an environment variable as PUP_TEST_URL.

```bash
// mac dev
export PUP_TEST_URL=http://192.168.0.14:3000
// alternate dev
export PUP_TEST_URL=http://192.168.3.14:3005
// stage
export PUP_TEST_URL=https://pupmoney-backend-stage.herokuapp.com
```

A valid email address must be provided for the tests to run as the environment variable PUP_TEST_EMAIL.

```bash
export PUP_TEST_EMAIL=valid-email@domain.com
```

Run tests:

```bash
npm test
```




## Postman
Alternate testing can be done with the Postman workspace created for PupMoney. The workspace contains a test for the production environment that is read only.

Also all endpoints can be executed maulayy using Postman. Open the Postman app using the button below. The Postman requests will be imported into a new Collection named PupMoney.

##### Global URL variable
The global URL variable must be changed to run against dev, stage or production.

dev: (usually) http://192.168.0.14:3000
stage: https://pupmoney-backend-stage.herokuapp.com
production: https://pupmoney-backend.herokuapp.com/



[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/22dad52eca154ff091e3)





## Endpoint Catalog

List of avalable endpoint calls.

### Users

- [POST /code](./users/get_code.md)
- [POST /me](./users/post_me.md)
- [GET /user](./users/get_user.md)
- [PATCH /user/email](./users/patch_email.md)
- [PATCH /user/name](./users/patch_name.md)

### Wallets
 
- [GET /wallets](./wallets/get_wallets.md)
- [GET /wallets/:wallet_id](./wallets/get_wallet.md)
- [POST /wallets](./wallets/post_wallet.md)
- [PATCH /wallets/:wallet_id](./wallets/patch_wallet.md)
- [PATCH /wallets/:wallet_id/currency](./wallets/patch_wallet_currency.md)
- [DELETE /wallets/:wallet_id](./wallets/delete_wallet.md)

### Vendors
 
- [GET /categories/:cat_id/vendors](./vendors/get_vendors.md)
- [GET /categories/:cat_id/vendors/:vendor_id](./vendors/get_vendor.md)
- [POST /categories/:cat_id/vendors](./vendors/post_vendor.md)
- [PATCH /categories/:cat_id/vendors/:vendor_id](./vendors/patch_vendor.md)
- [DELETE /categories/:cat_id/vendors/:vendor_id](./vendors/delete_vendor.md)


  
### Categories

- [GET /categories](./categories/get_categories.md)
- [GET /categories/:cat_id](./categories/get_category.md)
- [POST /categories](./categories/post_category.md)
- [PATCH /categories/:cat_id](./categories/patch_category.md)
- [DELETE /categories/:cat_id](./categories/delete_category.md)
- [DELETE /categories/:cat_id/:id](./categories/delete_move_category.md)




### Expenses

 - [GET /categories/:cat_id/expenses](./expenses/get_expenses.md)
 - [GET /categories/:cat_id/expenses/:exp_id](./expenses/get_expense.md)
 - [POST /categories/:cat_id/expenses](./expenses/post_expense.md)
 - [PUT /categories/:cat_id/expenses/:exp_id](./expenses/put_expense_item.md)
 - [DELETE /categories/:cat_id/expenses/:exp_id](./expenses/delete_expense.md)




### Admin

- [GET /admin/users](./admin/get_admin_users.md)
  


## Security

Endpoint security uses JWT and a wallet_id in the header. PupMoney uses a passwordless scheme to acquire a JWT Token by calling **POST /me**. All subsequent calls to endpoints will require the token in the Authorization Header except the endpoints **POST /code** and **POST /me**.

The wallet_id provided in the header is compared to the allowed wallet_ids in the JWT token to determine if access is allowed to the requested wallet. 

When a user calls **POST /me** they must provide their email and a code that was sent to them using **POST /code**.

```javascript
// Get a code
server
.post('/code')
.set('email', 'warren@hotmail.com')

// Access the passwordless JWT token
server
.post('/me')
.set('email', 'warren@hotmail.com')
.set('code', '56780')

// Auth Bearer
server
.get('/wallets')
.set('Authorization', 'Bearer '  +  token)
```



## Loggly

PupMoney uses Loggly to log all frontend or backend errors. All catch statements send an object to error() located in the ./providers/loggly.js file. Additonaly there is a info() function to log important events other than errors.



## Markdown Reader

While any markdown reader will work with these docs the author used "Markdown Reader" chrome extension. The reader shows a table of contents box that greatly aids in navigation.

