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
            debug('ping.js get');
            let versions = [];
            for(let i=0; i<postgresql.shards.length; i++){
                versions.push(postgresql.getDatabaseVersion(i));
            }

            res.status(200).send({statusCode:200, 
                ping:"pong",
                NODE_ENV:process.env.NODE_ENV,
                node_version:process.version,
                note:"PupMoney APIs.",
                shard_versions:versions,
                pup_version:pjson.version
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
