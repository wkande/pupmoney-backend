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
 * Returns a list of all expenses for a category within a date range.
 * The function called limits the return to 50 rows. "offset" is used 
 * to provide an offset value for the query as the starting point the next data set. 
 * 
 * This endpoint does validate the wallet_id but does not validate that the cat_id exists.
 * Passing a cat_id that does not exist will return an empty array and a count of zero.
 * 
 * A cat_id that truely does exist but without any expenses also returns an empty array and zero count.
 * 
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param q         - req.query.q
 * @param dttmStart - req.query.dttmStart
 * @param dttmEnd   - req.query.dttmEnd
 * @param skip      - req.query.skip
 */
router.get('/', function(req, res, next) {
    debug('expenses.js get');//, req.params, req.query, req.pupWallet)
    debug('>>>>>>> expenses.js get', req.query);
    async function getExpenses() {
        try{
            let cat_id = req.params.cat_id;
            req.query.q = req.query.q.replace(/ /g, ' & ');
            console.log('qqq >', req.query.q)
            var query = {
                name: 'expenses-get-by-category-id',
                text: `SELECT * FROM get_expenses($1, $2, $3, $4, $5, $6)`,
                values: [req.query.q, req.query.dttmStart, req.query.dttmEnd, req.pupWallet.id, cat_id, req.query.skip]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
 
            if(!data.rows[0].items) data.rows[0].items = []; // The row array may be null
            res.status(200).send({   
                statusCode:200, 
                statusMsg:"OK",
                user_id:req.pupUser.id,
                wallet_id:req.pupWallet.id,
                category_id:cat_id,
                rowCount:data.rows[0].items.length, 
                totalCount:data.rows[0].total_cnt,
                skip:req.query.skip,
                expenses:data.rows[0].items
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"expenses.get.getExpenses.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
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
    debug('expenses.js TEXT SEARCH get', req.params, req.query, req.pupWallet)
    async function getExpenses() {
        try{
            req.query.q = req.query.q.replace(/ /g, ' & ');
            console.log('qqq >', req.query.q)
            var query = {
                name: 'expenses-get-by-category-id-text-search',
                text: `SELECT * FROM get_expenses_text_search($1, $2, $3)`,
                values: [req.query.q, req.pupWallet.id, req.query.skip]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
 
            if(!data.rows[0].items) data.rows[0].items = []; // The row array may be null
            res.status(200).send({   
                statusCode:200, 
                statusMsg:"OK",
                user_id:req.pupUser.id,
                wallet_id:req.pupWallet.id,
                rowCount:data.rows[0].items.length, 
                totalCount:data.rows[0].total_cnt,
                skip:req.query.skip,
                expenses:data.rows[0].items
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"expenses.get.getExpenses_w_q.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getExpenses();
});


module.exports = router;
