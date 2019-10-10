const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
//const sendmail = require('sendmail')({silent: true});
const debug = require('debug')('pup:code.js');


/**
 * POST a new code. Sends an email with the code to the email in the body. Users must supply 
 * a code when POST /me is called to get user credentials. The code is stored in the CODE table 
 * and removed when POST /me is called.
 * @param email - req.body
 */
router.post('/', function(req, res, next) {
    
    async function sendCode(){
        try{
            debug('code.js post', req.body);
            let email = req.body.email;
            var code = generateCode();

            var query = {
                name: 'code-get',
                text: `INSERT INTO CODES (email, code, dttm) VALUES($1, $2, current_date) 
                    ON CONFLICT (email) DO UPDATE SET CODE = $2`,
                values: [email, code]
            };
            const data = await postgresql.shards[0].query(query);

            let obj = {data:{email:email, code:null}}
            if(process.env.NODE_ENV != 'production') obj.data.code = code;
            res.status(201).send(obj);

            /** TODO
             * Move away from sendmail and use and SMS provider.
             */

            /*sendmail({
                from: 'PupMoney <supportme@pupmoney.com>',
                to: email,
                subject: 'PupMoney Code Request',
                text: `PupMoney is an expenses management tool. A code `+code+` was requested for this email address. If you did not request the code 
          do nothing. If you are having trouble please respond 
          to this email and a help desk ticket will automatically be generated for you.\n\nRegards,\nPupMoney Support`,
                html: `PupMoney is an expenses management tool. 
                A code <span style="font-size:medium"><b>`+code+`</b></span> was requested for this email address. If you did not request the code 
                do nothing.  
                If you are having trouble please respond to this email and a help desk ticket will automatically be generated for you.<br><br>Regards,<br>
                PupMoney Support`,
              }, function(err, reply) {
                    if(err){ 
                        console.log(err);
                        err.message = 'Email not sent to '+email+'. - '+err.message;
                        return next(err);
                    }
                    let obj = {data:{email:email, code:null}}
                    if(process.env.NODE_ENV != 'production') obj.data.code = code;
                    res.status(201).send(obj);

            });*/
        }
        catch(err){
            console.log(err);
            next(err);
        }
    }
    sendCode();
});


/**
 * Generates a random five digit code.
 */
function generateCode() {
    return Math.floor(Math.random() * 90000) + 10000;
}


module.exports = router;
