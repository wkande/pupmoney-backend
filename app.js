
const pjson = require('./package.json');
console.log('\n\n/******************* PupMoney ********************/');
console.log('    THE SIMPLIFIED PERSONAL EXPENSES APP\n');
console.log('    Copyright Wyoming Software, Inc. 2018-2019');
console.log('    All rights reserved');
console.log('    support@pupmoney.com\n');
console.log('    process.env.NODE_ENV', process.env.NODE_ENV);
console.log('    version', pjson.version);
console.log('/*************************************************/\n');

const debug = require('debug')('pup:app.js');
const express = require('express');
const cors = require('cors')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser'); 
const logger = require('morgan');
const userRouter = require('./routes/user/user');
const emailRouter = require('./routes/user/email');
const nameRouter = require('./routes/user/name');
const adminUsersRouter = require('./routes/admin-users');
const codeRouter = require('./routes/code');
const walletsRouter = require('./routes/wallets/wallets');
const categoriesRouter = require('./routes/categories/categories');
const expensesRouter = require('./routes/expenses/expenses');
//const expensesRouter = require('./routes/categories/expenses');
const POSTGRESQL = require('./providers/postgresql');
const postgresql = new POSTGRESQL();
const SECURITY = require('./providers/security');
const security = new SECURITY();
const app = express();
const loggly = require('./providers/loggly');
loggly.info('STARTUP', {startup:new Date()});


// ****** Init the connection pool to PostgreSQL shards ******* //
postgresql.init();


// ****** CORS SETUP ******* //
app.use(cors()); 

// ****** Stops caching of data for all endpoints  ******* //
app.disable('etag');

// ****** SYSTEM ROUTES ******* //
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));  
app.use(bodyParser.json());


// ****** SECURITY ROUTES ******* //
app.use('/categories*', (req, res, next) => security.walletCheck(req, res, next));
app.use('/expenses*', (req, res, next) => security.walletCheck(req, res, next)); // Text search, expenses list (no cat) 
app.use('/wallet*', (req, res, next) => security.userCheck(req, res, next));
app.use('/user*', (req, res, next) => security.userCheck(req, res, next));
app.use('/admin*', (req, res, next) => security.adminCheck(req, res, next));


// ****** REST ROUTES ******* //
// This route must be in front of all /categories routes
// This is the only route for /expenses, all others must go thru /categories.
app.use('/expenses', expensesRouter); // Text search only

app.use('/categories', categoriesRouter); // Contains all /categories/:cat_id/expenses routes
app.use('/expenses', expensesRouter); // No category
app.use('/wallets', walletsRouter);
app.use('/code', codeRouter);
app.use('/user', userRouter);
app.use('/me', userRouter); // Me is an non-existant user so no security check to post a login (passwordless)
app.use('/user/email', emailRouter);
app.use('/user/name', nameRouter);
app.use('/admin/users', adminUsersRouter);

app.get('/ping', function(req, res, next) {
    res.status(200).send({statusCode:200, 
        ping:"pong",
        NODE_ENV:process.env.NODE_ENV,
        statusMessage:"online",
        note:"PupMoney APIs.",
        version:pjson.version
    })
});


// --> Public directory. <--
// app.use(express.static(path.join(__dirname, 'public')));


// --> DOCS on development only <--
if(process.env.NODE_ENV != 'prod'){
    app.use('/docs', express.static('docs'))
}


/**
 * Normally a generic error message occurs if no handler is found and there is no final
 * trap. The trap below sends a consistant JSON message back.
 * All responses in PupMoney have a statusCode and statusMessage in them whether they are an
 * error or successful response.
 */
app.use(function(req, res, next) {
    res.status(404).send({statusCode:404, 
        statusMessage:"Handler not found.",
        note:"PupMoney APIs."
    })
});


/**
 * Generic error trap for any route that fails. Generally this should not happen as 
 * each route should trapped errors before they get here.
 * All responses in PupMoney have a statusCode and statusMessage in them whether they are an
 * error or successful response.
 */
app.use((err, req, res, next) => {
    debug('--> DANGER in app.js: Generic error trap:', err.toString());
    res.status(500);
    res.send({
        statusCode:'500', 
        statusMsg:err.toString(),
        location:"Global error handler in app.js. This message should be investigated. Routes should handle errors."
    });
});

    
module.exports = app;
