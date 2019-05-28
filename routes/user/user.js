/**
 * Manages an individual user account.
 */


const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const UTILS = require('../../providers/utils');
const utils = new UTILS();
const debug = require('debug')('pup:user.js');


/**
 * GET a single user. JWT token required. The pupUser.id is derived from the JWT token.
 * Users cannot get the user info for other users unless they are a sysadmin and use a 
 * dedicated admin endpoint.
 * @param pupUser.id    - req.pupUser.id
 * 
 * Returns a new JWT token and user object.
 */
router.get('/', function (req, res, next) {
    async function getUser() {
        try {
            debug('user.js get', req.pupUser.id);
            // CHECK IF USER EXISTS
            let query = {
                name: 'user-get-bearer',
                text: `SELECT id, email, sys_admin, sub_expires, member_since, name FROM users WHERE id = $1`,
                values: [req.pupUser.id]
            };
            const data = await postgresql.shards[0].query(query);
            if (data.rows.length != 1) {
                res.status(401);
                return next("Invalid credentials please try login again.");
            }
            let user = data.rows[0];

            // GET WALLETS
            const walletsRef = await getWallets(user.id);
            user.wallets = walletsRef.rows;
            user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets)
            res.status(200).send({ user: user });
        }
        catch (err) {
            next(err);
        }
    }
    getUser();
});


/**
 * Returns a list of a user's wallets by user id.
 * @param user_id - user_id
 */
async function getWallets(user_id) {
    return new Promise((response, reject) => {
        var queryWallets = {
            name: 'wallets-get',
            text: `SELECT w.id, w.name, w.currency, u.id owner_id, u.name owner_name, u.email owner_email, w.dttm, w.default_wallet, w.shard
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
 * Creates a default wallet where the curency.percision key will be set to null. The caller 
 * must set the percision later for the default wallet.
 * @param email   - req.body.email
 * @param code    - req.body.code;
 * 
 * Returns a user object with a new JWT token.
 */
router.post('/', function (req, res, next) {

    async function addUser() {
        try {
            debug('user.js post', req.body);
            let email = req.body.email;
            let code = req.body.code;
            let user;

            // DELETE CODE //
            var queryCode = {
                name: 'code-delete',
                text: 'DELETE from codes WHERE email = $1 and code = $2',
                values: [email, code]
            };
            const data = await postgresql.shards[0].query(queryCode);
            if (data.rowCount != 1) {
                res.status(403);
                return next("Invalid code. Please enter the code sent to you or request another code.");
            }

            // GET USER IF EXISTS
            var queryUserExists = {
                name: 'user-does-user-exist',
                text: "SELECT * from users where email = $1",
                values: [email]
            };
            const userExistsRef = await postgresql.shards[0].query(queryUserExists);
            if (userExistsRef.rowCount == 1) {
                user = userExistsRef.rows[0];
                user.newAccount = false;
            }

            // POST A NEW USER IF NEEDED
            if (!user) {
                // Get the next shard
                let nextShard = await utils.getNextShard(); // GET NEXT SHARD

                // Create user
                var queryInsert = {
                    name: 'user-post',
                    text: "SELECT * from add_user(null, $1, $2)", // null is the fullname
                    values: [email, nextShard]
                };
                const insertRef = await postgresql.shards[0].query(queryInsert);
                if (insertRef.rowCount != 1) {
                    res.status(403);
                    return next(new Error("Failed to create user, no user data returned."));
                }
                user = insertRef.rows[0].add_user;
                user.newAccount = true;

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
            res.status(200).send({ user: user });
        }
        catch (err) {
            next(err);
        }
    }
    addUser();
});


module.exports = router;
module.exports.getWallets = getWallets;