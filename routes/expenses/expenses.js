/**
 * Provides all actions for multiple expense records.
 */


var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:expenses.js');


/**
 * Returns a list of all expenses within a date range and an optional text search (q) which is not required.
 * The function called limits the return to 50 rows. "offset" is used 
 * to provide an offset value for the query as the starting point the next data set. 
 * 
 * This endpoint does validate the wallet_id.
 * 
 * @param pupWallet - req.pupWallet
 * @param q         - req.query.q
 * @param dttmStart - req.query.dttmStart
 * @param dttmEnd   - req.query.dttmEnd
 * @param skip      - req.query.skip
 */
router.get('/', function(req, res, next) {
    debug('expenses/expenses.js get');
    async function getExpenses() {
        try{
            let cat_id = req.params.cat_id;
            req.query.q = req.query.q.replace(/ /g, ' & ');
            var query = {
                name: 'expenses-get-without-category-id',
                text: `SELECT * FROM get_expenses($1, $2, $3, $4, $5)`,
                values: [req.query.q, req.query.dttmStart, req.query.dttmEnd, req.pupWallet.id, req.query.skip]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(!data.rows[0].items){
                data.rows[0].items = []; // The row array may be null
            }
            res.status(200).send(
            {   user_id:req.pupUser.id,
                wallet_id:req.pupWallet.id,
                category_id:cat_id,
                rowCount:data.rows[0].items.length, 
                totalCount:data.rows[0].total_cnt,
                totalAmt:data.rows[0].total_amt,
                skip:req.query.skip,
                expenses:data.rows[0].items
            });
        }
        catch(err){
            next(err);
        }
    }
    getExpenses();
});


/**
 * Text search for expenses in all categories within a wallet.
 * 
 * @param pupWallet - req.pupWallet
 * @param q         - req.query.q
 * @param skip      - req.query.skip
 */
router.get('/context', function(req, res, next) {
    debug('expenses/expenses.js CONTEXT get', req.params, req.query)
    async function getExpenses() {
        try{
            req.query.q = req.query.q.replace(/ /g, ' & ');
            var query = {
                name: 'expenses-get-by-category-id-text-search',
                text: `SELECT * FROM get_expenses_text_search($4, $1, $2, $3)`,
                values: [req.query.q, req.pupWallet.id, req.query.skip, 'english']
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(!data.rows[0].items) {
                data.rows[0].items = []; // The row array may be null
            }
            res.status(200).send(
            {   user_id:req.pupUser.id,
                wallet_id:req.pupWallet.id,
                rowCount:data.rows[0].items.length, 
                totalCount:data.rows[0].total_cnt,
                skip:req.query.skip,
                expenses:data.rows[0].items
            });
        }
        catch(err){
            next(err);
        }
    }
    getExpenses();
});


module.exports = router;
