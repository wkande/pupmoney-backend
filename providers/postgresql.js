/**
 * Provides connection management to PostgreSQL.
 * @namespace PostgreSQL
 */


const { pg, Pool } = require('pg');
const debug = require('debug')('pup:postgresql.js');
debug('--> ...INIT');


/**
 * Class to export.
 * @memberof PostgreSQL
 */
function POSTGRESQL(){}


/**
 * Actual connections to the databases.
 * @var {array} shards
 * @memberof PostgreSQL
 */
POSTGRESQL.prototype.shards = [];
/**
 * Alias names to the databases, used by route queries.
 * @var {array} databases
 * @memberof PostgreSQL
 */
POSTGRESQL.prototype.databases = [];
/**
 * Minimum connections in the pool to each shard.
 * @var {number} minConn
 * @memberof PostgreSQL
 */
POSTGRESQL.prototype.minConn = 7;
/**
 * Maximum connections in the pool to each shard.
 * @var {number} maxConn
 * @memberof PostgreSQL
 */
POSTGRESQL.prototype.maxConn = 7;


/**
 * @summary Gathers the database configuration and creates connections to all shards. 
 * @description The databases array and 
 * the shards array are populated to match index-by-index.
 * @memberof PostgreSQL
 */
POSTGRESQL.prototype.init = async function(){
    debug('--> postgres.js > DB_URLS:', process.env.DB_URLS)
    const urls =  process.env.DB_URLS.split(' ');

    if(process.env.NODE_ENV === 'production'){
        POSTGRESQL.prototype.minConn = 7;
        POSTGRESQL.prototype.maxConn = 50;
    }

    for (var i=0; i<urls.length;i++){
        POSTGRESQL.prototype.shards.push( new Pool({connectionString: urls[i], 
            min:POSTGRESQL.prototype.minConn, 
            max:POSTGRESQL.prototype.maxConn, 
            idleTimeoutMillis: 2000, 
            connectionTimeoutMillis: 2000}) );
        let dbName = urls[i].split('/')[3]; // Extract the databse name, ex: (pup-0, pup-1, pup-2)
        POSTGRESQL.prototype.databases.push( dbName );

        /**
         * Shows an error in the logs if database errors.
         */   
        POSTGRESQL.prototype.shards[i].on('error', (err, client) => {
            console.error('--> postgres.js > **********************************');
            console.error('--> postgres.js > Unexpected error on db connection');
            console.error('--> postgres.js > code', err.code);
            console.error('--> postgres.js > user', err.client.user);
            console.error('--> postgres.js > database', err.client.database);
        });


        POSTGRESQL.prototype.shards[i].on('remove', (err, client) => {
            // console.log('--> postgres.js > Pool member removed');
        });

        POSTGRESQL.prototype.shards[i].on('acquire', (client) => {
            // console.log('--> postgres.js > Pool member acquired');
        });
    }

    debug('--> postgres > sharded database names:', POSTGRESQL.prototype.databases);


    /**
     * @summary Tickles the shard to get the connection pool started.
     * @param {number} shardNumb - The shard to query
     * @memberof PostgreSQL
     */
    let tickleShard = async function(shardNumb){
        try{
            var query = { name: 'select-now',text: 'SELECT NOW()' };
            const res = await POSTGRESQL.prototype.shards[shardNumb].query(query);
            debug('--> postgres > Connected to shard:', shardNumb,  POSTGRESQL.prototype.shards[shardNumb].options.connectionString);
        }
        catch(err){
            debug('++++++++++++++ Connect ERROR ++++++++++++++');
            debug(err);
        }
    };


    /**
     * @summary Spins through the shards to call tickleShard().
     * @memberof PostgreSQL
     */
    let initShards = async function(){
        for (let z=0; z<POSTGRESQL.prototype.shards.length;z++){
            const res = await tickleShard(z);
        }
    }


    initShards();
}


module.exports = POSTGRESQL;
