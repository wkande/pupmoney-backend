/**
 * Provides all actions for a single expense record.
 */


var express = require('express');
var router = express.Router({mergeParams: true});
const POSTGRESQL = require('../../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../../providers/loggly');
const debug = require('debug')('pup:expense.js');


/**
 * Returns a single expense. 
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param exp_id   - req.params.exp_id
 */
router.get('/:exp_id', function(req, res, next) {
    debug('expense.js get', req.params);
    async function getExpense() {
        try{
            let cat_id = req.params.cat_id;
            let exp_id = req.params.exp_id;
            var query = {
                name: 'expense-item-get-one',
                text: `SELECT e.id, e.category_id, e.vendor, e.note, e.amt, e.dttm, to_char(e.dttm,'Mon-DD-YYYY') date
                        FROM expenses e
                        JOIN categories c ON e.category_id = c.id
                        WHERE c.wallet_id = $1 AND e.category_id = $3 AND e.id = $2`,
                values: [req.pupWallet.id, exp_id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rowCount == 0){
                res.status(400);
                return next("No exp_id: "+exp_id+" for the requested cat_id "+cat_id+". Do you have the right wallet or category?")
            }
            res.status(200).send(
            {   user_id:req.pupUser.id,
                wallet_id:req.pupWallet.id,
                category_id:cat_id,
                expense:data.rows[0]
            });
        }
        catch(err){
            next(err);
        }
    }
    getExpense();
});


/**
 * Inserts an expense. 
 * @param pupWallet - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param note      - req.body.note
 * @param amt       - req.body.amt
 * @param dttm      - req.body.dttm
 * @param vendor    - req.body.vendor
 */
router.post('/', function(req, res, next) {
    debug('expense.js post', req.params, JSON.stringify(req.body));
    async function postExpense(){
        try{
            let cat_id = req.params.cat_id;
            // Insert item, trigger will update the txt search
            var query = {
                name: 'expense-post',
                text: `INSERT INTO expenses (category_id, vendor, note, amt, dttm)
                    SELECT $5, $2, $1, $3, $4
                    FROM categories
                    WHERE id = $5 AND wallet_id = $6
                    HAVING count(*) = 1
                    RETURNING *;`,
                values: [req.body.note, req.body.vendor, req.body.amt, req.body.dttm, cat_id, req.pupWallet.id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                res.status(400);
                return next("Bad Request: Insert failed. Possible record not found for cat_id "+cat_id);
            }
            let returnObj = {};
            returnObj.user_id = req.pupUser.id;
            returnObj.wallet_id = req.pupWallet.id;
            returnObj.rowCount = data.rowCount;
            returnObj.expense = data.rows[0];
            res.status(200).send( returnObj );
        }
        catch(err){
            next(err);
        }
    }
    postExpense();
});


/**
 * Updates an expense.
 * @param pupWallet - req.pupWallet
 * @param exp_id    - req.params.exp_id
 * @param cat_id    - req.params.cat_id - original
 * @param note      - req.body.note
 * @param amt       - req.body.amt
 * @param dttm      - req.body.dttm
 * @param vendor    - req.body.vendor
 * @param cat_id    - req.body.cat_id - new
 */
router.put('/:exp_id', function(req, res, next) {
    debug('expense.js put', req.params, JSON.stringify(req.body));
    async function putExpense(){
       try{ 
            // There is a trigger that prevents the expense from moving to another wallet
            let exp_id = req.params.exp_id;
            let cat_id = req.params.cat_id;
            let new_cat_id = req.body.cat_id;
            var query = {
                name: 'expense-put',
                text: `UPDATE expenses SET category_id = $1, note = $2, vendor = $3, amt = $4, dttm = $5
                    WHERE id = $6 AND category_id = $8
                    AND $1 in (SELECT id FROM categories WHERE id = $1 AND wallet_id = $7)
                    RETURNING *`,
                values: [new_cat_id, req.body.note, req.body.vendor, req.body.amt, req.body.dttm, exp_id, req.pupWallet.id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rows.length == 0){
                res.status(400);
                return next("Bad Request: Record not found for cat_id: "+cat_id+", exp_id: "+exp_id+". Also do you have the right wallet_id?");
            }
            let returnObj = {};
            delete data.rows[0].document; // text search doc
            returnObj.user_id = req.pupUser.id,
            returnObj.wallet_id = req.pupWallet.id;
            returnObj.org_category_id = cat_id;
            returnObj.category_id = new_cat_id;
            returnObj.rowCount = data.rowCount;
            returnObj.expense = data.rows[0];
            res.status(200).send( returnObj );
        }
        catch(err){
            next(err);
        }
    }
    putExpense();
});


/**
 * Deletes an expense.
 * @param wallet_id - req.pupWallet
 * @param cat_id    - req.params.cat_id
 * @param exp_id   - req.params.exp_id
 */
router.delete('/:exp_id', function(req, res, next) {
    debug('expense.js delete', req.pupWallet.shard, req.params);
    async function deleteExpense(){
        try{
            let cat_id = req.params.cat_id;
            let exp_id = req.params.exp_id;
            var query = {
                name: 'expense-item-delete',
                text: `DELETE FROM expenses WHERE id = $2 AND category_id = $3
                       AND category_id in (SELECT id FROM categories WHERE wallet_id = $1 AND id = $3)`,
                values: [req.pupWallet.id, exp_id, cat_id]
            };
            const data = await postgresql.shards[req.pupWallet.shard].query(query);
            if(data.rowCount == 0){
                res.status(400);
                return next("Bad Request: Record not found for exp_id: "+exp_id+". Do you have the right wallet_id?");
            }
            let returnObj = {};
            returnObj.rowCount = data.rowCount;
            res.status(200).send( returnObj );
        }
        catch(err){
            next(err);
        }
    };
    deleteExpense();
});



/*function getSearchTextDoc(exp_name, vendor, note, amt){
    if(!note) note = ' ';
    if(!vendor) vendor = '';
    return exp_name+' '+vendor+' '+note+' '+amt;
}*/

module.exports = router;
