const express = require('express');
const router = express.Router();
const POSTGRESQL = require('../providers/postgresql');
const postgresql = new POSTGRESQL();
var nodemailer = require('nodemailer');
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
            debug('EMAIL: ', req.body.email)
            let email = req.body.email;
            var code = generateCode();

            var query = {
                name: 'code-get',
                text: `INSERT INTO CODES (email, code, dttm) VALUES($1, $2, current_date) 
                    ON CONFLICT (email) DO UPDATE SET CODE = $2`,
                values: [email, code]
            };
            const data = await postgresql.shards[0].query(query);

            var transporter = nodemailer.createTransport({
                service: 'hotmail',
                auth: {
                  user: 'pupmoney@hotmail.com',
                  pass: process.env.EMAIL_PSWD
                }
              });

            var mailOptions = {
                from: 'pupmoney@hotmail.com',
                to: email,
                subject: 'PupMoney Login Code',
                text: `<div style="color:blue;font-size:medium">PupMoney is an expenses management tool. A code `+code+` was requested for this email address. If you did not request the code 
                do nothing. If you are having trouble please respond 
                to this email and a help desk ticket will automatically be generated for you.\n\nRegards,\nPupMoney Support`,
                      html: `PupMoney is an expenses management tool. 
                      A code <b>`+code+`</b> was requested for this email address. If you did not request the code 
                      do nothing.  
                      If you are having trouble please respond to this email and a help desk ticket will automatically be generated for you.<br><br>Regards,<br>
                      PupMoney Support</div>`
              };

            transporter.sendMail(mailOptions, function(err, info){
                if (err) {
                    console.log(err);
                    err.statusCode = 502
                    err.statusMsg = 'Email not sent to '+email+'. - '+err.message;
                    err.message = 'Email not sent to '+email+'. - '+err.message;
                    return next(err);
                } else {
                    let obj = {
                        statusCode :201,
                        statusMsg: 'OK',
                        data:{email:email, code:null}
                    }
                    if(process.env.NODE_ENV != 'production') obj.data.code = code;
                    res.status(201).send(obj);
                }
            });
        }
        catch(err){
            console.log(err);
            err.statusCode = 501;
            err.statusMsg = "Error creating DB record";
            err.note = "Possible cause: Be sure to send an email address in the body";
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
