/**
 * Provides all security for routes as implemented in the app.js file.
 * @namespace Security
 */


const debug = require('debug')('pup:security.js');
const jwt = require('jsonwebtoken');
const UTILS = require('./utils');
const utils = new UTILS();
const loggly = require('./loggly');
debug('--> ...INIT');


/**
 * Class to export.
 * @memberof Security
 */
function SECURITY(){}


/**
 * @summary Protects the /wallet path.
 * @description Adds the decoded JWT token to the request.
 * Checks the wallet_id in the header against the allowed wallet_ids in the JWT token.
 * Returns a 403 if token is not verified.
 * 
 * <p>Extracted from parameters</p>
 * <ul><li>req.pupWallet</li></ul>
 * 
 * @param {object} req - http request
 * @param {object} req - http response
 * @param {object} next - express forward
 * @memberof Security
 */
SECURITY.prototype.walletCheck = function(req, res, next){
    try{
        debug('\n------> Running WALLET Check <------');
        let arr = req.headers.authorization.split(' ');
        jwt.verify(arr[1], utils.jwtSecret, function(err, decoded) {
            if(err){
                console.log(err)
                let msg = {statusCode:403, 
                    statusMessage:'Invalid access, please login.',
                    err:err,
                    location:'security.js walletCheck evaluate'
                };
                loggly.error('Unknown email', msg);
                res.status(403).send(msg);
            }
            else{
                req.pupUser = decoded;
                // As part of security the wallet for all calls accessing a wallet's child tables must be in the header.
                req.pupWallet = JSON.parse(req.headers.wallet);
                // Does the wallet_id (from header) exists in the token for wallets.
                for(var i=0; i<decoded.wallets.length;i++){
                    if(req.pupWallet.id == decoded.wallets[i].id){
                        next();
                        return;
                    }
                }
                for(var i=0; i<decoded.sharedWallets.length;i++){
                    if(req.pupUser == decoded.sharedWallets[i].id){
                        next();
                        return;
                    }
                }
                // If we get here the wallet_id is unauthorized
                let msg = {statusCode:'401', statusMsg:'Access to the wallet_id is not authorized',
                        location:'SECURITY.walletCheck.inner',
                        note:'Invalid wallet ID.'
                    };
                loggly.error(msg);
                res.status(400).send(msg);
            }
        });
    }
    catch(err){
        let msg = {statusCode:'400', statusMsg:err.toString(),
                location:'SECURITY.walletCheck.outer',
                note:'Be sure to send the JWT token. Most PupMoney APIs will not work within a browser URL, try Postman.'
            };
        loggly.error(msg);
        res.status(400).send(msg);
    }
};


/**
 * @summary Protects the /user* path by verifing the JWT token that was passed in AUTH Bearer.
 * @description Returns a 403 if token is not verified.
 * 
 * <p>Extracted from parameters</p>
 * <ul><li>req.headers.authorization</li></ul>
 * 
 * @param {object} req - http request
 * @param {object} req - http response
 * @param {object} next - express forward
 * @memberof Security
 */
SECURITY.prototype.userCheck = function(req, res, next){
    try{
        debug('\n------> Running USER Check <------');
        let arr = req.headers.authorization.split(' ');
        jwt.verify(arr[1], utils.jwtSecret, function(err, decoded) {
            if(err){
                let msg = {statusCode:403, 
                    statusMessage:'Invalid access, please login.',
                    err:err,
                    location:'security.js userCheck evaluate'
                };
                loggly.error('Unknown', msg);
                res.status(403).send(msg);
            }
            else{
                req.pupUser = decoded;
                next();
            }
        });
    }
    catch(err){
        let msg = {statusCode:'400', statusMsg:err.toString(),
                    location:'SECURITY.userCheck',
                    note:'Be sure to send the JWT token. Most PupMoney APIs will not work within a browser URL, try Postman.'
                };
        loggly.error(msg);
        res.status(400).send(msg);
    }
};


/**
 * @summary Protects the /admin* path by verifing the JWT token that was passed in AUTH Bearer.
 * @description Returns a 403 if token is not verified.
 * 
 * <p>Extracted from parameters</p>
 * <ul><li>req.headers.authorization</li></ul>
 * 
 * @param {object} req - http request
 * @param {object} req - http response
 * @param {object} next - express forward
 * @memberof Security
 */
SECURITY.prototype.adminCheck = function(req, res, next){
    try{
        debug('\n------> Running ADMIN Check <------');
        let arr = req.headers.authorization.split(' ');
        jwt.verify(arr[1], utils.jwtSecret, function(err, decoded) {
            if(err){
                let msg = {statusCode:403, 
                    statusMessage:'Invalid access, please login.',
                    err:err,
                    location:'security.js adminCheck evaluate token'
                };
                loggly.error('Unknown', msg);
                res.status(403).send(msg);
            }
            else{
                if(decoded.sys_admin != 1){
                    let msg = {statusCode:403, 
                        statusMessage:'Not an admin, please login as an admin.',
                        err:err,
                        location:'security.js adminCheck evaluate admin'
                    };
                    loggly.error(msg);
                    res.status(403).send(msg);
                }
                else{
                    req.pupUser = decoded;
                    next();
                }
            }
        });
    }
    catch(err){
        let msg = {statusCode:'400', statusMsg:err.toString(),
            location:'SECURITY.adminCheck',
            note:'Be sure to send the JWT token. Most PupMoney APIs will not work within a browser URL, try Postman.'
        };
        loggly.error(msg);
        res.status(400).send(msg);
    }
}


module.exports = SECURITY;