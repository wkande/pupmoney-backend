/**
 * Manage a user email address
 */


const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const UTILS = require('../../providers/utils');
const utils = new UTILS();
const userModule = require('./user');
const debug = require('debug')('pup:email.js');


/** 
 * PATCH (updates) a user email address. The userCheck in the security module guarantees that
 * the current user (id, email) has been validated. 
 * 
 * A code must have been requested prior to this call for the new email address 
 * which will be sent to the new email address.
 * @param email     - req.pupUser.email;
 * @param new_email - req.body.email;
 * @param code      - req.body.code;
 * @param user_id        - req.pupUser.id
 * 
 * Returns new user object with a new JWT token.
 */
router.patch('/', function(req, res, next) {
    debug('email.js patch', req.body);
    async function updateEmail() {
        try{
            let new_email = req.body.new_email;

            // DELETE CODE
            var query = {
                name: 'user-email-code-delete',
                text: 'DELETE FROM codes WHERE email = $1 AND code = $2',
                values: [new_email, req.body.code]
            };
            const dataCode = await postgresql.shards[0].query(query);
            if (dataCode.rowCount != 1){
                res.status(403);
                return next("Invalid code. Please enter the code sent to you or request another code.");
            }

            // UPDATE EMAIL
            var query2 = {
                name: 'user-email-update',
                text: `UPDATE users SET email = $1 WHERE email = $2 AND id = $3 RETURNING *`,
                values: [new_email, req.pupUser.email, req.pupUser.id]
            };
            const data = await postgresql.shards[0].query(query2);
            let user = data.rows[0];

            // WALLETS using Promise.all
            // getWallets is exported by the user.js file
            var queryPromises = Promise.all([ userModule.getWallets(user.id)])
            .then((results) => {
                user.wallets = results[0].rows;
                user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets);
                res.status(200).send({ user:user });
            })
            .catch(err => {
                next(err);
            });
        }
        catch(err){
            next(err);
        }
    }
    updateEmail();
});


module.exports = router;
