/**
 * Yearly subscriptions.
 */


const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
const UTILS = require('../providers/utils');
const utils = new UTILS();
const debug = require('debug')('pup:subscription.js');
const loggly = require('../providers/loggly');
const moment = require('moment');


/** 
 * Creates a new subscription for one year.
 * 
 * Returns a user object with a new JWT token which contains the updated sub_expires date.
 */
router.post('/', function(req, res, next) {

        async function addSubscription() {
            try{
                debug('subscription.js post', req.body, user.id);
                let user = req.pupUser;

                let current_expire = user.sub_expires;
                console.log('>>> current_expire', current_expire);

                // From the current expiration
                let current = moment(user.sub_expires).format('YYYY-MM-DD');
                let fromCurrent = moment(current).add(366, 'days');
                // From today
                let today = moment().format('YYYY-MM-DD');
                let fromToday = moment(today).add(366, 'days');


                console.log('moment fromCurrent',  fromCurrent._d);
                console.log('moment fromToday',  fromToday._d);

                let expires; 
                if(fromCurrent > fromToday || fromCurrent === fromToday){ 
                    console.log('fromCurrent >= fromToday'); 
                    expires = moment(fromCurrent).format('YYYY-MM-DD');
                }
                else{
                    console.log('fromToday > fromCurrent'); 
                    expires = moment(fromToday).format('YYYY-MM-DD');
                }
                console.log('NEW expires', expires); 

                
                // POST TO STRIPE



                // UPDATE THE USER SUB_EXPIRE COLUMN
                var queryUserExpires = {
                    name: 'update-user-sub-expire',
                    text: "UPDATE USERS SET sub_expires = $1 where id = $2 RETURNING *",
                    values: [expires, user.id]
                };
                const userRef = await postgresql.shards[0].query(queryUserExpires);
                console.log('rowCount', userRef.rowCount);
                if (userRef.rowCount == 1){
                    user.sub_expires = userRef.rows[0].sub_expires;
                    user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets)
                }
                else{
                    // OUCH what do we do
                }

                // TEMP
                if(1==1){
                    // REPONSE
                    console.log('user.sub_expires', user.sub_expires)
                    res.status(200).send( {statusCode:200, statusMsg:"OK", user:user} );
                    return;
                }


                


                // INSERT STRIPE RESULTS TO SUBSCRIPTIONS
                var queryUserExists = {
                    name: 'insert-subscriptions',
                    text: "INSERT into SUBSCRIPTIONS  where email = $1",
                    values: [email]
                };
                const userExistsRef = await postgresql.shards[0].query(queryUserExists);
                if (userExistsRef.rowCount == 1){
                    user = userExistsRef.rows[0];
                    user.newAccount = false;
                }

     

                // GET WALLETS
                //const walletsRef = await getWallets(user.id);
                //user.wallets = walletsRef.rows;

                // REPONSE
                user.token = utils.generateJwtToken(user.id, user.name, user.email, user.member_since, user.sub_expires, user.sys_admin, user.wallets)
                res.status(200).send( {statusCode:200, statusMsg:"OK", user:user} );
            }
            catch(err){
                next(err);
            }
        }
        addSubscription();

});


module.exports = router;