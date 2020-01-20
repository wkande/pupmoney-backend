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

            let body = {statusCode:200, statusMessage:"OK",
                ping:"pong",
                NODE_ENV:process.env.NODE_ENV,
                node_version:process.version,
                note:"PupMoney APIs.",
                shard_versions:versions,
                pup_version:pjson.version
            }
            res.status(200).send(body)
            if(process.env.NODE_ENV != 'production'){ 
                console.log('Response Body')
                console.dir(body);
            }
        }
        catch(err){
            next(err);
        }
    }
    sendPong();
});


module.exports = router;
