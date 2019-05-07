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
 * Returns a list of all expenses for a category within a date range and an optional text search.
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
    debug('categories/expenses.js get');
    async function getExpensesByCategory() {
        try{
            let cat_id = req.params.cat_id;
            req.query.q = req.query.q.replace(/ /g, ' & ');
            var query = {
                name: 'expenses-get-by-category-id',
                text: `SELECT * FROM get_expenses_by_category($1, $2, $3, $4, $5, $6)`,
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
                totalAmt:data.rows[0].total_amt,
                skip:req.query.skip,
                expenses:data.rows[0].items
            });
        }
        catch(err){
            console.log(err)
            let msg = {statusCode:500, statusMsg:err.toString(), location:"expenses.get.getExpensesByCategory.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getExpensesByCategory();
});


module.exports = router;
