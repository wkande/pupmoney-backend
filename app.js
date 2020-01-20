
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
const subscriptionRouter = require('./routes/subscription');
const emailRouter = require('./routes/user/email');
const nameRouter = require('./routes/user/name');
const adminUsersRouter = require('./routes/admin-users');
const codeRouter = require('./routes/code');
const pingRouter = require('./routes/ping');
const walletsRouter = require('./routes/wallets/wallets');
const categoriesRouter = require('./routes/categories/categories');
const expensesRouter = require('./routes/expenses/expenses');
const POSTGRESQL = require('./providers/postgresql');
const postgresql = new POSTGRESQL();
const SECURITY = require('./providers/security');
const security = new SECURITY();
const app = express();
const loggly = require('./providers/loggly');
loggly.info({ msg: "STARTUP", dttm: new Date() });
const css = 'font-weight:bold;font-size:medium';


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

// ****** DEV ONLY ******** //
if(process.env.NODE_ENV != 'production'){
    app.use('/*', (req, res, next) => {
        try{
            console.clear();
            console.log('\n>>> REQUEST OBJECT -------------------------------------');
            if(req.headers.wallet){
                console.log('\n%cWallet', css);
                console.dir(JSON.parse(req.headers.wallet));
            }
                
            console.log('\n%cHeaders', css)
            console.dir(req.headers);
            console.log('\n%cBody', css)
            console.dir(req.body);
            console.log('\n%cQuery', css)
            console.dir(req.query);
        }
        catch(err){
            console.error(err);
        }
        finally{
            console.log('\n>>> -------------- -------------------------------------\n');
            next();
        }
    });
}


// ****** SECURITY ROUTES ******* //
app.use('/categories*', (req, res, next) => security.walletCheck(req, res, next));
app.use('/expenses*', (req, res, next) => security.walletCheck(req, res, next)); // Text search, expenses list (no cat) 
app.use('/wallet*', (req, res, next) => security.userCheck(req, res, next));
app.use('/user*', (req, res, next) => security.userCheck(req, res, next));
app.use('/subscription*', (req, res, next) => security.userCheck(req, res, next));
app.use('/admin*', (req, res, next) => security.adminCheck(req, res, next));


// ****** REST ROUTES ******* //
// This route must be in front of all /categories routes
// This is the only route for /expenses, all others must go thru /categories.
app.use('/expenses', expensesRouter); // Text search only

app.use('/categories', categoriesRouter); // Contains all /categories/:cat_id/expenses routes
app.use('/expenses', expensesRouter); // No category
app.use('/wallets', walletsRouter);
app.use('/code', codeRouter);
app.use('/ping', pingRouter);
app.use('/user', userRouter);
app.use('/me', userRouter); // Me is an non-existant user so no security check to post a login (passwordless)
app.use('/user/email', emailRouter);
app.use('/user/name', nameRouter);
app.use('/subscription', subscriptionRouter);
app.use('/admin/users', adminUsersRouter);


// --> Public directory. <--
// app.use(express.static(path.join(__dirname, 'public')));


// --> DOCS on development only <--
if (process.env.NODE_ENV != 'prod') {
    app.use('/docs', express.static('docs'))
}


/**
 * Normally a generic error message occurs if no handler is found and there is no final
 * trap. The trap below sends a consistant JSON message back.
 * All responses in PupMoney have a statusCode and statusMessage in them whether they are an
 * error or successful response.
 */
if(process.env.NODE_ENV != 'production'){
    app.use(function (req, res, next) {
        res.status(404).send({
            statusCode: 404,
            statusMessage: "Handler not found.",
            statusMsg: "Handler not found.",
            note: "Did not locate the requested path."
        })
    });
}


/**
 * Generic error trap for any route that fails. 
 * All responses have a statusCode and statusMessage in the response body.
 */
app.use((err, req, res, next) => {
    debug('+++++++++++++++++++++ GLOBAL ERROR HANDLER ++++++++++++++++++++++++');
    loggly.error(err);
    // Unhandled errors (no catch block) will carry a 200 code by default.
    if(res.statusCode === 200){
        res.statusCode = 500;
    }
    res.status(res.statusCode).send(err);
    //res.status(res.statusCode).send({message:err.toString()});
});


/**
 * Restart needed as the process is no longer stable.
 */
process.on('uncaughtException', function (err) {
    console.log('\n+++++++++++++++++++++ uncaughtException ++++++++++++++++++++++++');
    console.error((new Date).toUTCString() + ' uncaughtException:', err.message);
    console.error(err.stack);
    loggly.error(err);
    process.exit(1)
  })


module.exports = app;
