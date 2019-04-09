/**
 * Provides all actions for a sinlge category record.
 */


var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:category.js');


/**
 * Gets a single category.
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 */
router.get('/:cat_id', function(req, res, next) {
    debug('category.js get', req.params)
    async function getCategory() {
        try{

            // Get the the count of all expenses for s category
            var queryTrans = {
                name: 'category-get-cnt-of-expenses',
                text: `SELECT count(*) cnt FROM expenses WHERE category_id = $1`,
                values: [req.params.cat_id]
            };
            const dataTrans = await postgresql.shards[req.pupWallet.shard].query(queryTrans);
            let transactionCnt = dataTrans.rows[0].cnt;
            console.log(transactionCnt)

            // Get the category
            var query = {
                name: 'category-get-one',
                text: `SELECT id, wallet_id, name, vendors, dttm FROM categories WHERE id = $1 AND wallet_id = $2`,
                values: [req.params.cat_id, req.pupWallet.id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"No category with the requested walletID and catID.", location:"category.get.getCatgegory"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{    
                let cat = data.rows[0];
                let returnObj = {
                    statusCode:200, 
                    statusMsg:"OK",
                    wallet_id:req.pupWallet.id,
                    transactionCnt:transactionCnt,
                    category:cat
                };
                res.status(200).send(returnObj);
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.get.getCategory.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getCategory();
});


/**
 * Creates a new category within a wallet.
 * @param pupWallet - req.pupWallet
 * @param name      - req.body.name
 * @param icon      - req.body.icon
 */
router.post('/', function(req, res, next) {
    debug('category.js post', req.params)
    async function postCategory(){
        try{
            var query = {
                name: 'category-post',
                text: `INSERT INTO categories (wallet_id, name) VALUES($1, $2) RETURNING *`,
                values: [req.pupWallet.id, req.body.name]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not created.", location:"category.post.postCategory"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                let returnObj = {statusCode:201, statusMsg:"OK"};
                returnObj.wallet_id = req.pupWallet.id,
                returnObj.rowCount = data.rowCount;
                returnObj.category = data.rows[0];
                res.status(201).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.post.postCategory.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    postCategory();
});


/**
 * Updates the category name.
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param name      - req.body.name
 */
router.patch('/:cat_id/name', function(req, res, next) {
    debug('category.js patch > name', req.params, JSON.stringify(req.body))
    async function patchCategoryName(){
        try{
            let cat_id = req.params.cat_id;
            var query = {
                name: 'category-patch-name-only',
                text: `UPDATE categories SET name = $1 WHERE wallet_id = $2 AND id = $3 RETURNING *`,
                values: [req.body.name, req.pupWallet.id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for category_id: "+cat_id,  location:"category.patch.patchName"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                let returnObj = {statusCode:200, statusMsg:"OK"};
                returnObj.wallet_id = req.pupWallet.id,
                returnObj.rowCount = data.rowCount;
                returnObj.category = data.rows[0];
                res.status(200).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.patch.patchName.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    patchCategoryName();
});


/**
 * Updates the category vendors array.
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param vendors   - req.body.vendors
 */
router.patch('/:cat_id/vendors', function(req, res, next) {
    debug('category.js patch > vendors', req.params, JSON.stringify(req.body))
    async function patchCategoryVendors(){
        try{
            let cat_id = req.params.cat_id;
            var query = {
                name: 'category-patch-vendors-only',
                text: `UPDATE categories SET vendors = $1 WHERE wallet_id = $2 AND id = $3 RETURNING *`,
                values: [req.body.vendors, req.pupWallet.id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for category_id: "+cat_id,  location:"category.patch.patchVendors"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                let returnObj = {statusCode:200, statusMsg:"OK"};
                returnObj.wallet_id = req.pupWallet.id,
                returnObj.rowCount = data.rowCount;
                returnObj.category = data.rows[0];
                res.status(200).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.patch.patchVendors.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    patchCategoryVendors();
});


/**
 * Deletes an category. All expenses will delete via ON DELETE CASCADE.
 * @param pupWallet - req.pupWallet
 * @param cat_id - req.params.cat_id
 */
router.delete('/:cat_id', function(req, res, next) {
    debug('category.js delete', req.params)
    async function deleteCategory(){
        try{
            let cat_id = req.params.cat_id;
            var query = {
                name: 'category-delete',
                text: `DELETE FROM categories WHERE wallet_id = $1 AND id = $2`,
                values: [req.pupWallet.id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rowCount == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for category_id: "+cat_id, location:"category.delete.deleteCategory"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                let returnObj = {statusCode:200, statusMsg:"DELETED category_id: "+cat_id};
                returnObj.rowCount = data.rowCount;
                res.status(200).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.delete.deleteCategory.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    deleteCategory();
});


/**
 * Deletes a category. All expenses are preserved by first moving them to a 
 * different category. A DB trigger keeps them in the same wallet.
 * @param pupWallet - req.pupWallet
 * @param cat_id - req.params.cat_id
 * @param id - req.params.id
 */
router.delete('/:cat_id/:id', function(req, res, next) {
    debug('category.js delete w/move', req.params)
    async function deleteCategory(){
        try{
            let cat_id = req.params.cat_id;
            let id = req.params.id;

            // Move expense items, a DB trigger keeps them in the same wallet
            var queryMove = {
                name: 'category-move-delete-move',
                text: `UPDATE expenses SET category_id = $1 WHERE category_id = $2 `,
                values: [id, cat_id]
            };
            const dataMove = await postgresql.shards[req.pupWallet.shard].query(queryMove);

            // Delete category
            var query = {
                name: 'category-delete',
                text: `DELETE FROM categories WHERE wallet_id = $1 AND id = $2`,
                values: [req.pupWallet.id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rowCount == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for category_id: "+cat_id+" wallet_id: "+req.pupWallet.id, location:"category.deleteCategory.deleteExpense"};
                loggly.error(msg);
                res.status(500).send(msg);
            }
            else{ 
                let returnObj = {statusCode:200, statusMsg:"DELETED category_id: "+cat_id};
                returnObj.rowCount = data.rowCount;
                res.status(200).send( returnObj );
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"category.delete_move.deleteCategory.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    deleteCategory();
});



module.exports = router;
