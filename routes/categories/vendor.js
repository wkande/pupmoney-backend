/**
 * Provides all actions for a single vendor record.
 */


var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:vendor.js');


/**
 * Gets a single vendor from a category.
 * @param pupWallet - req.pupWallet
 * @param cat_id - req.params.cat_id
 * @param vendor_id - req.params.vendor_id
 * 
 */
router.get('/:vendor_id', function(req, res, next) {
    debug('vendor.js get', req.pupWallet.shard, req.params);
    async function getVendor() {
        let cat_id = req.params.cat_id;
        let vendor_id = req.params.vendor_id;
        try{
            var query = {
                name: 'vendor-get-one',
                text: `SELECT id, name FROM vendors WHERE category_id = $1 AND id = $2`,
                values: [cat_id, vendor_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg ={statusCode:400, statusMsg:"No vendor with the requested vendor_id/exp_id.", location:"vendor.get.getVendor"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{
                res.status(200).send({
                    statusCode:200, 
                    statusMsg:"OK",
                    wallet_id:req.pupWallet.id,
                    category_id:cat_id,
                    vendor:{
                        id:data.rows[0].id,
                        name:data.rows[0].name
                    }
                });
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"vendor.get.getVendor.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getVendor();
});


/**
 * Creates a new vendor.
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param name      - req.body.name
 */
router.post('/', function(req, res, next) {
    debug('vendor.js post', req.params);
    async function postVendor(){
        try{
            let cat_id = req.params.cat_id;
            let name = req.body.name;
            var query = {
                name: 'vendor-post',
                text: `INSERT INTO vendors (category_id, name)
                    SELECT $2, $3 
                    FROM categories
                    WHERE id = $2 AND wallet_id = $1
                    HAVING count(*) = 1
                    RETURNING *;`,
                values: [req.pupWallet.id, cat_id, name]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Vendor record not created.", location:"vendor.post.postVendor"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                res.status(201).send( {
                    statusCode:201, 
                    statusMsg:"OK", 
                    wallet_id:req.pupWallet.id,
                    category_id:cat_id,
                    vendor:data.rows[0]
                });
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"vendor.post.postVendor.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    postVendor();
});


/**
 * Updates a vendor.
 * This is a PATCH because the expense_id cannot be changed.
 * @param pupWallet - req.pupWallet
 * @param vendor_id - req.params.vendor_id
 * @param cat_id    - req.params.cat_id
 * @param name      - req.body.name
 */
router.patch('/:vendor_id', function(req, res, next) {
    debug('vendor.js patch', req.params, req.body);
    async function patchVendor(){
        try{
            let vendor_id = req.params.vendor_id;
            let cat_id = req.params.cat_id;
            let name = req.body.name;
            var query = {
                name: 'vendor-patch',
                text: `UPDATE vendors SET name = $1 WHERE category_id = $2 AND id = $3 RETURNING *`,
                values: [name, cat_id, vendor_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for vendor_id/category_id.", location:"vendor.patch.patchVendor"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{ 
                res.status(200).send( {
                    statusCode:200,
                    statusMsg:"OK", 
                    wallet_id:req.pupWallet.id,
                    category_id:cat_id,
                    vendor:data.rows[0]
                });
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"vendor.patch.patchVendor.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    patchVendor();
});


/**
 * Deletes a vendor. 
 * @param pupWallet - req.pupWallet
 * @param vendor_id - req.params.vendor_id
 * @param ecat_id   - req.params.cat_id
 * 
 */
router.delete('/:vendor_id', function(req, res, next) {
    debug('vendor.js patch', req.params);
    async function deleteVendor(){
        try{
            let vendor_id = req.params.vendor_id;
            let cat_id = req.params.cat_id;
            var query = {
                name: 'vendor-delete',
                text: `DELETE FROM vendors WHERE category_id = $1 AND id = $2 `,
                values: [cat_id, vendor_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rowCount == 0 ){
                let msg = {statusCode:400, statusMsg:"Bad Request: Record not found for category_id/wallet_id.", location:"vendor.delete.deleteVendor"};
                loggly.error(msg);
                res.status(500).send(msg);
            }
            else{ 
                res.status(200).send( {
                    statusCode:200, 
                    statusMsg:"DELETED vendor_id: "+vendor_id,
                    wallet_id:req.pupWallet.id,
                    category_id:req.pupWallet.id,
                    rowCount:data.rowCount
                });
            }
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), sqlcode:err.code, location:"vendor.delete.deleteVendor.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    };
    deleteVendor();
});


module.exports = router;
