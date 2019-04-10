/**
 * Sends errors and info messages to Loggly.
 * @path providers/loggly.js
 * @namespace Loggly
 * @see https://www.loggly.com
 */


const https = require('https');
const debug = require('debug')('pup:loggly.js');
debug('--> ...INIT');


/**
 * @summary Sends a single error object to a loggly service
 * @memberof Loggly
 * @param {object} obj - message object with error
 */
module.exports.error = function (obj) { 
    try{
        obj.type = 'error';
        if(process.env.NODE_ENV=='production'){
            send(obj);
        }  
        else{
            send('error', obj);
            debug('-------------- ERROR ----------------');
            debug('-->', obj);
        }
    }
    catch(err){
        // If this fails do not want to blow up the server.
        // Just ouptut to console.
        console.log('===== module.exports.error =====');
        console.log(err); 
    }
};


/**
 * @summary Sends a single info object to a loggly service. Used for information messages in the code.
 * @memberof Loggly
 * @param {object} obj - message object with information
 */
module.exports.info = function (obj) { 
    try{
        obj.type = 'info';
        if(process.env.NODE_ENV=='production'){
            send(obj);
        } 
        else{
            debug('-------------- INFO ----------------');
            debug('-->', obj);
        }
    }
    catch(err){
        // If this fails do not want to blow up the server.
        // Just ouptut to console.
        console.log('===== module.exports.info =====');
        console.log(err);
    }
};


/**
 * @summary Remember the last object sent to loggly. Used to prevent log over-run.
 * @memberof Loggly
 * @var {object} lastObj
 */
let lastObj;


/**
 * @summary Sends the message to loggly. Repeated messages are not allowed to prevent 
 * log over-run.
 * @memberof Loggly
 * @param {object} obj - message with location, type and others
 */
function send(obj){
    // Prevent log over-run
    if(lastObj === JSON.stringify(obj)){
        debug('NOT LOGGING TO LOGGLY')
        return;
    }
    lastObj = JSON.stringify(obj);
    const data = JSON.stringify(obj);

    const options = {
    hostname: 'logs-01.loggly.com',
    port: 443,
    path: '/inputs/1e90e9d9-53ee-4144-a02c-9f5c72f4c923/pupmoney/http/',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
        }
    }

    const req = https.request(options, (res) => {
            if(res.statusCode != 200){
                console.error('**************\n--> loggly did not return 200:', res.statusCode);
            }
        })
        
    req.on('error', (error) => {
        console.error('**************\n--> loggly error:', error);
    })
    
    req.write(data);
    req.end();
}


