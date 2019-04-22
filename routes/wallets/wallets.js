/**
 * Provides all actions for multiple wallet records.
 */
 

var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:wallets.js');
const walletRouter = require('./wallet');


// get (wallets) will use the route in this file 
// get, post, patch, delete (wallet) will enter the walletRouter
router.use('/', walletRouter); // get, post, put, delete (wallet)


/**
 * Returns a list of all user owned wallets and wallets shared by other
 * users to the current user.
 * @param user_id - req.pupUser.id
 */
router.get('/', function(req, res, next) {

    async function getWallets() {
        try{
            debug('wallets.js get', req.params);
            let user_id = req.pupUser.id;
            var query = {
                name: 'wallets-get-all-by-user',
                text: `SELECT w.id, w.name, u.id owner_id, u.name owner_name, u.email owner_email, w.dttm, w.default_wallet, w.shard
                FROM USERS u JOIN WALLETS w  
                ON w.user_id = u.id WHERE u.id = $1 OR $1 = ANY (shares)`,
                values: [user_id]
            };
            const data = await postgresql.shards[0].query(query); 
            res.status(200).send({   
                statusCode:200, 
                statusMsg:"OK",
                user_id:req.pupUser.id,
                user_email:req.pupUser.email,
                rowCount:data.rows.length,
                wallets:data.rows
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"wallets.get.getWallets.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getWallets();
});


module.exports = router;
