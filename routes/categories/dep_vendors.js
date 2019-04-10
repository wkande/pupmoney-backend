/**
 * Vendors list for quick picks. 
 * Provides all actions for a multiple vendor records.
 */
 

var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const vendorRouter = require('./vendor');
const debug = require('debug')('pup:vendors.js');


/**
 * Returns a list of all vendors associated with a category.
 * @param wallet - req.pupWallet
 * @param cat_id - req.params.cat_id
 */
router.get('/', function(req, res, next) {
    debug('vendors.js get', req.params);
    async function getVendors() {
        try{
            var query = {
                name: 'vendors-get-all-by-category',
                text: "SELECT id, name FROM vendors where category_id = $1 order by name",
                values: [req.params.cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            res.status(200).send({   
                statusCode:200, 
                statusMsg:"OK",
                wallet_id:req.pupWallet.id,
                category_id:req.params.cat_id,
                rowCount:data.rows.length,
                vendors:data.rows
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"vendors.get.getVendors.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getVendors();
});


module.exports = router;
