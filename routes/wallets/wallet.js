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
                res.status(400);
                return next("No wallet with the requested wallet_id: "+wallet_id);
            }  
            let returnObj = 
            {   user_id:req.pupUser.id,
                user_email:req.pupUser.email,
                wallet:data.rows[0]
            };
            res.status(200).send(returnObj);
        }
        catch(err){
            next(err);
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
 * @param currency - req.body.currency
 */
router.post('/', function(req, res, next) {

    async function postWallet(){
        try{
            debug('wallet.js post', req.params, req.body);
            // Get the next shard
            let nextShard = await utils.getNextShard(); // GET NEXT SHARD

            // Create wallet
            var query = {
                name: 'wallet-post',
                text: `INSERT INTO wallets (user_id, name, shares, shard, currency) VALUES($1, $2, $3, $4, $5) RETURNING *`,
                values: [req.pupUser.id, req.body.name, req.body.shares, nextShard, req.body.currency]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                res.status(400);
                return next("Bad Request: Wallet not created.");
            }

            let returnObj = {};
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
        catch(err){
            next(err);
        }
    };
    postWallet();
});


/**
 * Updates a wallet's name and shares.
 * Returns a wallet object.
 * @param wallet_id - req.params.wallet_id
 * @param user_id - req.pupUser.id
 * @param name - req.body.name
 * @param shares - req.body.shares
 * @param currency - req.body.currency
 */
router.patch('/:wallet_id', function(req, res, next) {

    async function patchWallet(){
        try{
            debug('wallet.js patch', req.params, req.body);
            let wallet_id = req.params.wallet_id;
            var query = {
                name: 'wallet-patch-name-shares',
                text: `UPDATE wallets SET name = $1, shares = $2, currency = $5
                    WHERE user_id = $3 AND id = $4 RETURNING *`,
                values: [req.body.name, req.body.shares, req.pupUser.id, wallet_id, req.body.currency]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                res.status(400);
                return next("Bad Request: Record not found for wallet_id: "+wallet_id);
            }
            let returnObj = {user_id:req.pupUser.id};
            returnObj.rowCount = data.rowCount;
            returnObj.wallet = data.rows[0];
            res.status(200).send( returnObj );
        }
        catch(err){
            next(err);
        }
    };
    patchWallet();
});


/**
 * Updates a wallet's currency percision.
 * Returns a wallet object.
 * @param wallet_id - req.params.wallet_id
 * @param user_id - req.pupUser.id
 * @param currency - req.body.curency
 */
router.patch('/:wallet_id/currency', function(req, res, next) {

    async function patchWallet(){
        try{
            debug('wallet.js patch>currency', req.params, req.body);
            let wallet_id = req.params.wallet_id;
            var query = {
                name: 'wallet-patch-currency',
                text: `UPDATE wallets SET currency = $1
                    WHERE user_id = $2 AND id = $3 RETURNING *`,
                values: [req.body.currency, req.pupUser.id, wallet_id]
            };
            const data = await postgresql.shards[0].query(query);
            if(data.rows.length == 0){
                res.status(400);
                return next("Bad Request: Record not found for wallet_id: "+wallet_id);
            }
            let returnObj = {};
            returnObj.rowCount = data.rowCount;
            returnObj.wallet = data.rows[0];
            res.status(200).send( returnObj );
        }
        catch(err){
            next(err);
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
                res.status(400);
                return next("Bad Request: Shard not found for wallet_id or wallet is the default wallet: "+wallet_id);
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
                res.status(400);
                return next("Bad Request: Record not found for wallet_id or wallet is the default wallet: "+wallet_id);
            }

            // FINALIZE DELETE wallet
            var queryDeleteWalletShard = {
                name: 'wallet-finalize-delete-wallet-in-shard',
                text: "SELECT * from delete_wallet_shard($1)", 
                values: [wallet_id]
            };
            const deleteWalletShardRef = await postgresql.shards[shard].query(queryDeleteWalletShard);
            //  @todo Somthing might work better here
            if(data.rowCount != 1 ){
                let msg = {message:"Bad Request: Wallet child rows now completly deleted, manual cleanup needed.", location:"wallet.delete.deleteWallet.delete-child-rows"};
                loggly.error(msg);
                // Do not return, this error left orphaned rows in child tables that can be cleanded manullay.
                // If not cleaned up this does not hurt the app
            }

            // RESPOND
            let resObj = {};
            resObj.rowCount = data.rowCount;
            res.status(200).send( resObj );
        }
        catch(err){
            next(err);
        }
    };
    deleteWallet();
});


module.exports = router;
