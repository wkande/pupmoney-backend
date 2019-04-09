/**
 * Provides all actions for multiple category records.
 */


var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const categoryRouter = require('./category');
const expensesRouter = require('./expenses');
const expenseRouter = require('./expense');
const debug = require('debug')('pup:categories.js');
const vendorsRouter = require('./vendors');
const vendorRouter = require('./vendor');


router.use('/:cat_id/vendors', vendorRouter); // get, post, put, delete (vendor)
router.use('/:cat_id/vendors', vendorsRouter); // get (vendors)


// get (expenses) 
// This route must come before the next (expenseRouter) route
router.use('/:cat_id/expenses', expensesRouter); // get (expenses)
router.use('/:cat_id/expenses', expenseRouter); // get, put, delete (expense)

// get (categories) will use the route in this file
// get, post, patch, delete (category) will enter the categoryRouter
router.use('/', categoryRouter); // get, post, put, delete (expense)


/**
 * Returns a list of all categories for a wallet. Attached is a summary 
 * of expense amounts for each category for the time period requested.
 * @param pupWallet - req.pupWallet
 * @param q         - req.query.q
 * @param dttmStart - req.query.dttmStart
 * @param dttmEnd   - req.query.dttmEnd
 */
router.get('/', function(req, res, next) {
    
    async function getCategories() {
        try{
            debug('categories.js get');//, req.params, req.query, req.pupWallet.id);
            req.query.q = req.query.q.replace(/ /g, ' | ');
            var query = {
                name: 'expenses-get-all-by-user',
                text: `SELECT id, wallet_id, name, vendors, dttm, get_category_summary($4, $2, $3, id) sum
                    FROM CATEGORIES 
                    WHERE wallet_id = $1 order by name`,
                values: [req.pupWallet.id, req.query.dttmStart, req.query.dttmEnd, req.query.q]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                let msg = {statusCode:400, statusMsg:"No categories for the requested walletID.", location:"getCategories.get"};
                loggly.error(msg);
                res.status(400).send(msg);
            }
            else{  
                res.status(200).send({   
                    statusCode:200, 
                    statusMsg:"OK",
                    user_id:req.pupUser.id,
                    wallet_id:req.pupWallet.id,
                    rowCount:data.rows.length,
                    dttmStart:req.query.dttmStart,
                    dttmEnd:req.query.dttmEnd,
                    categories:data.rows
                });
            }
        }
        catch(err){
            let msg= {statusCode:500, statusMsg:err.toString(), location:"wallet.get.getCategories.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getCategories();
});


module.exports = router;
