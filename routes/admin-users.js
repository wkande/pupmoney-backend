var express = require('express');
var router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
const loggly = require('../providers/loggly');
const debug = require('debug')('pup:admin-users.js');


/**
 * GET list of users. Must be a system admin. 
 * The JWT token will contain the sysadmin flag.
 * @param offset - req.params.offset
 */
router.get('/', function(req, res, next) {

    /** @TODO Convert this to await */
    async function getUsers() {
        try{
            debug('admin-users.js get', req.params);
            /**
             * @TODO Move this query to a PSQL function call and include the totalCount value
             */
            if(!req.params.offset) req.params.offset = 0;
            var query = {
                name: 'users-get',
                text: "SELECT * from USERS LIMIT 50 OFFSET $1",
                values: [req.params.offset]
            };
            postgresql.shards[0].query(query, (err, data) => {
                try{
                    if(err) {
                        let msg = {statusCode:500, statusMsg:err.toString(), location:"admin-users.get.query.err"};
                        loggly.error(msg);
                        res.status(500).send(msg);
                    }
                    else{
                        res.status(200).send({statusCode:200, statusMsg:"OK",
                        offset:req.params.offset, 
                        rowCount:data.rowCount, 
                        users:data.rows});
                    }
                }
                catch(err){
                    let msg = {statusCode:500, statusMsg:err.toString(), location:"admin-users.get.query.execute"};
                    loggly.error(msg);
                    res.status(500).send(msg);
                }
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"admin-users.get.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    getUsers();
});


module.exports = router;
