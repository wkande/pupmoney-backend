const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
const debug = require('debug')('pup:code.js');
const loggly = require('../providers/loggly');
const pjson = require('../package.json');


/**
 * Returns system information.
 */
router.get('/', function(req, res, next) {
    
    async function sendPong(){
        try{
            debug('ping.js get', req.body);

            var query = {name: 'ping-get', text: `dd SHOW server_version`};
            const data = await postgresql.shards[0].query(query);

            res.status(200).send({statusCode:200, 
                ping:"pong",
                NODE_ENV:process.env.NODE_ENV,
                statusMessage:"online",
                note:"PupMoney APIs.",
                db_version:data.rows[0].server_version.split(' ')[0],
                app_version:pjson.version
            })
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"ping.get.outer"};
            loggly.error(msg);
            res.status(500).send(msg);
        }
    }
    sendPong();
});


module.exports = router;
