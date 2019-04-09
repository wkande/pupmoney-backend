const https = require('https');
const debug = require('debug')('pup:loggly.js');

debug('--> ...INIT');
debug('-->', process.env.NODE_ENV);


/**
 * Sends a single error object to a loggly service
 * @param object      - msg object with error
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
 * Sends a single info object to a loggly service. Used for information messages in the code.
 * @param object        - msg object with info
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
 * Remember the last obj sent to loggly. Used to prevent log over-run.
 */
let lastObj;


/**
 * Sends the message to loggly. Repeated messages are not allowed to prevent 
 * log over-run.
 * @param obj   - message with location, type and others
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


