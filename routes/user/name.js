/**
 * Manage a user name
 */


var express = require('express');
var router = express.Router();
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
var utils = require('../../providers/utils');
let userModule = require('./user');
var debug = require('debug')('pup:name.js');
const loggly = require('../../providers/loggly');


/** 
 * PATCH (updates) a user name. 
 * @param name     - req.body.name;
 * @param user_id  - req.pupUser.id
 * @param email    - req.pupUser.email
 * 
 * Returns new user object with a new JWT token and.
 */
router.patch('/', function(req, res, next) {
    debug('name.js get', req.body);
    async function updateName() {
        try{

            // UPDATE NAME
            var query2 = {
                name: 'user-name-update',
                text: `UPDATE users SET name = $1 WHERE email = $2 AND id = $3 RETURNING *`,
                values: [req.body.name, req.pupUser.email, req.pupUser.id]
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
                debug(err);
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
    updateName();
});


module.exports = router;
