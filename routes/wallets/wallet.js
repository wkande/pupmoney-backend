/**
 * Provides all actions for a sinlge wallet record.
 */


const express = require('express');
const router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:wallet.js');
const UTILS = require('../../providers/utils');
const utils = new UTILS();


/**
 * Gets a single wallet.
 * @param wallet_id - req.params.wallet_id
 * @param user_id   - req.pupUser.id
 */
router.get('/:wallet_id', function(req, res, next) {

    async function getWallet() {
        try{
            debug('wallet.js get', req.params);
            let wallet_id = req.params.wallet_id;
            var query = {
                name: 'wallet-get-one',
                text: `SELECT w.id, w.name, w.shares, w.shard, w.default_wallet, w.dttm, u.id owner_id, u.name owner_name, u.email owner_email
                        FROM wallets w 
                        JOIN users u ON w.user_id = u.id
                        WHERE (u.id = $1 AND w.id = $2) OR ($1 = ANY(w.shares) AND w.id = $2)`,
                values: [req.pupUser.id, wallet_id]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"No wallet with the requested wallet_id: "+wallet_id, location:"wallet.get.getWallet"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{    
                let returnObj = {
                    statusCode:200, 
                    statusMsg:"OK",
                    user_id:req.pupUser.id,
                    user_email:req.pupUser.email,
                    wallet:data.rows[0]
                };
                res.status(200).send(returnObj);
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"wallet.get.getWallet.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getWallet();
});


/**
 * Creates a new wallet.
 * Returns a wallet object.
 * @param user_id - req.pupUser.id
 * @param name - req.body.name
 * @param shares - req.body.shares
 */
router.post('/', function(req, res, next) {

    async function postWallet(){
        try{
            console.log('\n -------- > POST WALLET ========================')
            console.log("USER_ID", req.pupUser.id)
            debug('wallet.js post', req.params, req.body);
            // Get the next shard
            let nextShard = await utils.getNextShard(); // GET NEXT SHARD

            // Create wallet
            var query = {
                name: 'wallet-post',
                text: `INSERT INTO wallets (user_id, name, shares, shard) VALUES($1, $2, $3, $4) RETURNING *`,
                values: [req.pupUser.id, req.body.name, req.body.shares, nextShard]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Wallet not created.", location:"wallet.post.postWallet"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 

                let returnObj = {statusCode:201, statusMsg:"OK"};
                returnObj.rowCount = data.rowCount;
                returnObj.wallet = data.rows[0];

                // Finalize wallet
                var queryFinalize = {
                    name: 'wallet-finalize-wallet-in-shard',
                    text: "SELECT * from finalize_wallet($1)", 
                    values: [returnObj.wallet.id]
                };
                const finalizeRef = await postgresql.shards[nextShard].query(queryFinalize);

                /**
                 *  @TODO If finalize fails delete wallet?
                 */

                res.status(201).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"wallet.post.postWallet.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    postWallet();
});


/**
 * Updates a wallet.
 * Returns a wallet object.
 * @param wallet_id - req.params.wallet_id
 * @param user_id - req.pupUser.id
 * @param name - req.body.name
 * @param shares - req.body.shares
 */
router.patch('/:wallet_id', function(req, res, next) {

    async function patchWallet(){
        try{
            debug('wallet.js patch', req.params, req.body);
            let wallet_id = req.params.wallet_id;
            var query = {
                name: 'wallet-patch',
                text: `UPDATE wallets SET name = $1, shares = $2
                    WHERE user_id = $3 AND id = $4 RETURNING *`,
                values: [req.body.name, req.body.shares, req.pupUser.id, wallet_id]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for wallet_id: "+wallet_id, location:"wallet.patch.patchWallet"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                let returnObj = {statusCode:200, statusMsg:"OK", user_id:req.pupUser.id};
                returnObj.rowCount = data.rowCount;
                returnObj.wallet = data.rows[0];
                res.status(200).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"wallet.patch.patchWallet.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    patchWallet();
});


/**
 * Deletes a wallet. All child table rows will delete via db function.
 * @param wallet_id - req.params.wallet_id
 * @param user_id - req.pupUser.id
 */
router.delete('/:wallet_id', function(req, res, next) {

    async function deleteWallet(){
        try{
            debug('wallet.js delete', req.params);
            let wallet_id = req.params.wallet_id;
            // GET SHARD
            var queryWallet = {
                name: 'wallet-find-shard',
                text: `SELECT shard FROM wallets WHERE default_wallet = 0 AND user_id = $1 AND id = $2 `,
                values: [req.pupUser.id, wallet_id]
            };
            const dataFind = await postgresql.shards[0].query(queryWallet);
            if(dataFind.rowCount == 0 ){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for wallet_id or wallet is the default wallet: "+wallet_id, location:"wallet.delete.deleteWallet.find"};
                loggly.error(msg);
                res.status(400).send(msg);
                return;
            }
            let shard = dataFind.rows[0].shard;

            // DELETE from WALLETS
            var query = {
                name: 'wallet-delete',
                text: `DELETE FROM wallets WHERE default_wallet = 0 AND user_id = $1 AND id = $2 `,
                values: [req.pupUser.id, wallet_id]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rowCount == 0 ){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for wallet_id or wallet is the default wallet: "+wallet_id, location:"wallet.delete.deleteWallet.delete"};
                loggly.error(msg);
                res.status(400).send(msg);
                return;
            }

            // FINALIZE DELETE wallet
            var queryDeleteWalletShard = {
                name: 'wallet-finalize-delete-wallet-in-shard',
                text: "SELECT * from delete_wallet_shard($1)", 
                values: [wallet_id]
            };
            const deleteWalletShardRef = await postgresql.shards[shard].query(queryDeleteWalletShard);
            if(data.rowCount != 1 ){
                let msg = {statusCode:400, statusMsg:"Bad Request: Wallet child rows now completly deleted, manual cleanup needed.", location:"wallet.delete.deleteWallet.delete-child-rows"};
                loggly.error(msg);
                // Do not return, this error left orphaned rows in child tables that can be cleanded manullay.
                // If not cleaned up this does not hurt the app
            }

            // RESPOND
            let resObj = {statusCode:200, statusMsg:"DELETED wallet_id: "+wallet_id};
            resObj.rowCount = data.rowCount;
            res.status(200).send( resObj );
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), sqlcode:err.code, location:"wallet.delete.deleteWallet.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    deleteWallet();
});


module.exports = router;
