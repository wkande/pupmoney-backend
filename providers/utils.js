/**
 * Provides all security for routes as implemented in the app.js file.
 * @namespace Utils
 */


const jwt = require('jsonwebtoken');
const POSTGRESQL = require('./postgresql');
const postgresql = new POSTGRESQL();
const debug = require('debug')('pup:utils.js');
debug('--> ...INIT');


/**
 * Prints process.argv at startup.
 */
process.argv.forEach((val, index) => {
    debug(`--> ${index}: ${val}`);
});


function UTILS(){}


/**
 * @summary Setup the JWT_SECRET key from the startup environment variables.
 * @memberof Utils
 */
UTILS.prototype.jwtSecret = process.env.JWT_SECRET;
debug('--> jwtSecret', UTILS.prototype.jwtSecret);


/**
 * @summary Generates a JWT Token for AUTH/Bearer. Parameters are columns from the USERS table.
 * @param {number} id 
 * @param {string} name
 * @param {string} email
 * @param {string} member_since
 * @param {string} sub_expires
 * @param {number} sys_admin
 * @param {array} wallets
 * @param {array} sharedWallets
 * @memberof Utils
 */
UTILS.prototype.generateJwtToken = function(id, name, email, member_since, sub_expires, sys_admin, wallets){
    let userTokenInfo = {id, name, email, member_since, sub_expires, sys_admin, wallets};
    console.log(1, UTILS.prototype.jwtSecret. userTokenInfo)
    return jwt.sign(userTokenInfo, UTILS.prototype.jwtSecret);
};


/**
 * @summary Gets the database (shard) with the least amount of data to use 
 * as the home shard for a wallet.
 * @memberof Utils
 */
UTILS.prototype.getNextShard = async function (){
    // These two arrays are in sync index wise
    // POSTGRESQL.prototype.shards = [];
    // POSTGRESQL.prototype.databases = [];
    try{
        let sizes = [];
        for (let z=0; z<postgresql.databases.length;z++){
            // Get the db name from databases
            let dbName = postgresql.databases[z];
            try{
                var query = { name: "select-shard", text: "select pg_database_size('"+dbName+"')" };
                const res = await postgresql.shards[z].query(query);
                let size = parseInt(res.rows[0].pg_database_size);
                //if(z===0) size = (size*2.5);
                sizes.push(size);
            }
            catch(err){
                debug('++++++++++++++ GET SHARD ERROR ++++++++++++++');
                debug(err);
                throw err;
            }
        }
        // https://www.google.com/search?q=js+string+to+number&rlz=1C5CHFA_enUS824US824&oq=js+string+to+number&aqs=chrome..69i57.3255j0j4&sourceid=chrome&ie=UTF-8
        let shard = sizes.indexOf(Math.min.apply(null,sizes))
        return shard;
    }
    catch(err){
        debug(err);
        throw err;
    }
}


module.exports = UTILS;
