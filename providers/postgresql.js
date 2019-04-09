const debug = require('debug')('pup:postgresql.js');

debug('--> ...INIT');


const { pg, Pool } = require('pg');


function POSTGRESQL(){}


POSTGRESQL.prototype.shards = [];
POSTGRESQL.prototype.databases = [];



POSTGRESQL.prototype.init = async function(){
    debug('--> postgres.js > DB_URLS:', process.env.DB_URLS)
    const urls =  process.env.DB_URLS.split(' ');

    for (var i=0; i<urls.length;i++){
        POSTGRESQL.prototype.shards.push( new Pool({connectionString: urls[i], min:7, max:7, connectionTimeoutMillis: 2000}) );
        let dbName = urls[i].split('/')[3];
        POSTGRESQL.prototype.databases.push( dbName );

        //console.log('====================',POSTGRESQL.prototype.shards[i])

        /**
         * Shows an error in the logs if database goes down.
         */   
        POSTGRESQL.prototype.shards[i].on('error', (err, client) => {
            console.error('--> postgres.js > **********************************');
            console.error('--> postgres.js > Unexpected error on db connection');
            console.error('--> postgres.js > code', err.code);
            console.error('--> postgres.js > user', err.client.user);
            console.error('--> postgres.js > database', err.client.database);
            //process.exit(-1);
        });


        POSTGRESQL.prototype.shards[i].on('remove', (err, client) => {
            //console.log('--> postgres.js > Pool member removed');
        });

        POSTGRESQL.prototype.shards[i].on('acquire', (client) => {
            //console.log('--> postgres.js > Pool member acquired');
        });
    }

    debug('--> postgres > sharded database names:', POSTGRESQL.prototype.databases);


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


    let initShards = async function(){
        for (let z=0; z<POSTGRESQL.prototype.shards.length;z++){
            const res = await tickleShard(z);
        }
    }
    initShards();
}



/**
 * Generate the connection string based on ENV variable.
 */
/*let connectionString = process.env.DB_URL;
if (connectionString === undefined) {
    connectionString = "postgres://127.0.0.1:5432/pup-0";
}
console.log('-------------> postgres.js > connection URL:', connectionString);
*/


/*POSTGRESQL.prototype.pool = new Pool({
    connectionString: connectionString,
    max: 50, // set pool max size to 20
    min: 4, // set min pool size to 4
    idleTimeoutMillis: 1000, // close idle clients after 1 second
    connectionTimeoutMillis: 3000, // return an error after 3 seconds if connection could not be established
});


POSTGRESQL.prototype.pool.on('error', (err, client) => {
  console.error('--> postgres.js > Unexpected error on idle client (db)', err);
  //process.exit(-1);
});


POSTGRESQL.prototype.pool.on('remove', (err, client) => {
    //console.log('--> postgres.js > Pool member removed');
    //process.exit(-1);
});


POSTGRESQL.prototype.pool.on('acquire', (client) => {
    //console.log('--> postgres.js > Pool member acquired');
});


POSTGRESQL.prototype.initwwww = async function(){
    // Get DB date
    this.pool.query('SELECT NOW()', (err, res) => {
      if(err) console.log('> postgres.js > ERROR -----', err);
      else console.log('--> postgres.js > connected');
    });
};*/


module.exports = POSTGRESQL;
