/**
 * Manage a user name
 */


var express = require('express');
var router = express.Router();
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const UTILS = require('../../providers/utils');
const utils = new UTILS();
const userModule = require('./user');
const debug = require('debug')('pup:name.js');


/** 
 * PATCH (updates) a user name. 
 * @param name     - req.body.name;
 * @param user_id  - req.pupUser.id
 * @param email    - req.pupUser.email
 * 
 * Returns new user object with a new JWT token.
 */
router.patch('/', function(req, res, next) {
    debug('name.js patch', req.body.name);
    async function updateName() {
        try{
            // UPDATE NAME
            var query2 = {
                name: 'user-name-update-by-email-id',
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
    updateName();
});


module.exports = router;
