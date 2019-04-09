
var express = require('express');
var router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
const sendmail = require('sendmail')({silent: true});
var debug = require('debug')('pup:code.js');
const loggly = require('../providers/loggly');


/**
 * POST a new code. Sends an email with the code to the email in the body.
 * @param email - req.body
 */
router.post('/', function(req, res, next) {
    
    /** @TODO Convert this to await */
    async function sendCode(){
        try{
            debug('code.js post', req.body);
            let email = req.body.email;
            var code = generateCode();
            // Access db here
            var query = {
                name: 'code-get',
                text: `INSERT INTO CODES (email, code, dttm) VALUES($1, $2, current_date) 
                    ON CONFLICT (email) DO UPDATE SET CODE = $3`,
                values: [email, code, code]
            };

            postgresql.shards[0].query(query, (err, data) => {
                try{
                    if(err) {
                        let msg = {statusCode:500, statusMsg:err.toString(), location:"code.post.query.err"};
                        loggly.error(email, msg);
                        res.status(500).send(msg);
                    }
                    else{
                        sendCodeViaEmail(email, code);
                        let obj = {statusCode:201, statusMsg:"Created",
                        data:{email:email, code:"sent via email"}}
                        if(process.env.NODE_ENV != 'production') obj.data.code = code;
                        res.status(201).send(obj);
                    }
                }
                catch(err){
                    let msg = {statusCode:500, statusMsg:err.toString(), location:"code.post.query.execute"};
                    loggly.error(email, msg);
                    res.status(500).send(msg);
                }
            });
        }
        catch(err){
            let msg = {statusCode:500, statusMsg:err.toString(), location:"outer"};
            loggly.error(email, msg);
            res.status(500).send();
        }
    }
    sendCode();

});


/**
 * Generates a random code.
 */
function generateCode() {
    return Math.floor(Math.random() * 90000) + 10000;
  }
  

/**
 * Sends an email to an email address with a new code.
 * @param email - user email address
 * @param code - new code
 */
function sendCodeViaEmail(email, code){
    try{
        sendmail({
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
                    let msg = {statusCode:500, statusMsg:err.toString(), location:"code.post.sendCodeViaEmail.execute"};
                    loggly.error(email, msg);
                }
                loggly.info(email, "EMAIL SENT w/CODE");
                // No response when the email is sent. The user will not get an in-app confirmation of success.
                // They will need to check their email.
        });
    }
    catch(err){
        let msg = {statusCode:500, statusMsg:err.toString(), location:"code.post.sendCodeViaEmail.outer"};
        loggly.error(email, msg);
    }
    
  }


module.exports = router;
