/**
 * Manage a user email address
 */


var express = require('express');
var router = express.Router();
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
var utils = require('../../providers/utils');
let userModule = require('./user');
var debug = require('debug')('pup:email.js');
const loggly = require('../../providers/loggly');


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
 * Returns new user object with a new JWT token and.
 */
router.patch('/', function(req, res, next) {
    debug('email.js get', req.body);
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
                res.status(554).send({statusCode:554, statusMsg:"Invalid code.", location:"password.patch.updateEmail.code"});
                return;
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
                res.status(200).send(
                {   statusCode:200, 
                    statusMsg:"OK", 
                    user:user
                });
            })
            .catch(err => {
                let msg = {statusCode:500, statusMsg:err.code+"-"+err.toString(), location:"email.patch.updateEmail.promise.all"};
                loggly.error(msg);
                res.status(500).send(msg);
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"email.patch.updateEmail.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    updateEmail();
});


module.exports = router;
