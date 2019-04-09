/**
 * Manages a individual user account.
 */


var express = require('express');
var router = express.Router();
var debug = require('debug')('backend:server');
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
var utils = require('../../providers/utils');
const loggly = require('../../providers/loggly');


/**
 * GET a single user. JWT token required. The pupUser.id is derived from the JWT token.
 * Users cannot get the user info for other users unless they are a sysadmin and use a 
 * dedicated admin endpoint.
 * @param pupUser.id    - req.pupUser.id
 * 
 * Returns a new JWT token and user object.
 */
router.get('/', function(req, res, next) {
    try{
        async function getUser() {
            try{
        console.log('get user', req.pupUser.id)
                // CHECK IF USER EXISTS
                let query = { 
                    name: 'user-get-bearer',
                    text: `SELECT id, email, sys_admin, sub_expires, member_since, name FROM users WHERE id = $1`,
                    values: [req.pupUser.id]
                };
                const data = await postgresql.shards[0].query(query);
                if (data.rows.length == 0){
                    res.status(403).send({statusCode:403, statusMsg:"Invalid credentials please try login again."});
                    return;
                }
                let user = data.rows[0]
    
                // GET WALLETS
                const walletsRef = await getWallets(user.id);
                user.wallets = walletsRef.rows;
                user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets)
                res.status(200).send( {statusCode:200, statusMsg:"OK", user:user} );
            }
            catch(err){
                res.status(500).send({statusCode:500, statusMsg:err.code+"-"+err.toString(), location:"user.get.query.execute"});
            }
        }
        getUser();
    }
    catch(err){
        res.status(500).send({statusCode:500, statusMsg:err.toString(), location:"user.get.outer"});
    }
});


/**
 * Returns a list of a user's wallets by user id.
 * @param user_id - user_id
 */
async function getWallets(user_id) {
    return new Promise((response, reject) => {
        var queryWallets = {
            name: 'wallets-get',
            text: `SELECT w.id, w.name, u.id owner_id, u.name owner_name, u.email owner_email, w.dttm, w.default_wallet, w.shard
            FROM USERS u JOIN WALLETS w  
            ON w.user_id = u.id WHERE u.id = $1 OR $1 = ANY (shares)`,
            values: [user_id]
        };
        response(postgresql.shards[0].query(queryWallets));
    });
}


/** 
 * Creates a new user if one does not exist. The endpoint is used for the 
 * passwordless access to Pupmony. A code must have been requested prior to this call.
 * @param email   - req.body.email
 * @param code    - req.body.code;
 * 
 * Returns a user object with a new JWT token.
 */
router.post('/', function(req, res, next) {
    try{
        let email = req.body.email;
        let code = req.body.code;
        let user;

        async function addUser() {
            try{
                // DELETE CODE //
                var queryCode = {
                    name: 'code-delete',
                    text: 'DELETE from codes WHERE email = $1 and code = $2',
                    values: [email, code]
                };
                const data = await postgresql.shards[0].query(queryCode);
                if (data.rowCount != 1){
                    res.status(554).send({statusCode:554, statusMsg:"Invalid code. Please request another code.", 
                        location:"me.post.addUser.queryCode.invalid"});
                    return;
                }

                // GET USER IF EXISTS
                var queryUserExists = {
                    name: 'user-does-user-exist',
                    text: "SELECT * from users where email = $1",
                    values: [email]
                };
                const userExistsRef = await postgresql.shards[0].query(queryUserExists);
                if (userExistsRef.rowCount == 1){
                    user = userExistsRef.rows[0];
                }

                // POST A NEW USER IF NEEDED
                if(!user){ 
                        // Get the next shard
                        let nextShard = await utils.getNextShard(); // GET NEXT SHARD

                        // Create user
                        var queryInsert = {
                            name: 'user-post',
                            text: "SELECT * from add_user(null, $1, $2)", // null is the fullname
                            values: [email, nextShard]
                        };
                        const insertRef = await postgresql.shards[0].query(queryInsert);
                        if (insertRef.rowCount != 1){
                            res.status(403).send({statusCode:403, statusMsg:"Failed to create user, no user data returned.",
                                location:"me.post.rowCount"});
                            return;
                        }
                        user = insertRef.rows[0].add_user;

                        // Get wallets (temporary)
                        const walletsRef = await getWallets(user.id);
                        const tmp_wallet_id = walletsRef.rows[0].id; // The default wallet id

                        // Finalize wallet
                        var queryFinalize = {
                            name: 'user-finalize-wallet-in-shard',
                            text: "SELECT * from finalize_wallet($1)", 
                            values: [tmp_wallet_id]
                        };
                        const finalizeRef = await postgresql.shards[nextShard].query(queryFinalize);

                        /**
                         *  @TODO If finalize fails delete user?
                         */
                }        

                // GET WALLETS
                const walletsRef = await getWallets(user.id);
                user.wallets = walletsRef.rows;

                // REPONSE
                user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets)
                res.status(200).send( {statusCode:200, statusMsg:"OK", user:user} );
            }
            catch(err){
                res.status(500).send({statusCode:500, statusMsg:err.toString(), location:"me.post.addUser.outer"});
            }
        }
        addUser();
    }
    catch(err){
        res.status(500).send({statusCode:500, statusMsg:err.toString(), location:"me.get.outer"});
    }
});


module.exports = router;
module.exports.getWallets = getWallets;