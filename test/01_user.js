// https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/

/**
 * Be sure to set PUP_TEST_URL for beta url, leave null for dev.
 * Set PUP_TEST_EMAIL for email account for login.
 * 
 * export PUP_TEST_EMAIL='<email_here>'
 * export PUP_TEST_URL='https://pupmoney-beta.herokuapp.com'
 */


var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
global.server = supertest.agent(url); // The Nodejs server to test
global.email = process.env.PUP_TEST_EMAIL;



console.log("\n++++++++++++++ TESTING +++++++++++++++++")
console.log('PUP_TEST_URL >>>', global.server.app);
console.log('EMAIL_PUP_TEST_EMAIL >>>', global.email);


describe("GET /ping --> 01_user.js ", function () {
  it("access ping", function (done) {
    this.timeout(6000);
    global.server
      .get("/ping")
      .timeout(5000)
      .expect(200)
      .end(function(err,res){
        if (err) {
          console.log(err);
          done(err);
        }
        else{
          let obj = JSON.parse(res.text);
          obj.pup_version.should.exist;
          obj.ping.should.equal('pong');
          done();
        }
      });
  });
});


describe('POST /code --> 01_user.js', function() {
  it('sends a code to a user\'s email', function(done) {
      this.timeout(6000);
      global.server
        .post('/code')
        .send({email:global.email})
        .timeout(5000)
        .expect(201)
        .end(function(err,res){
          if (err) {
            console.log(err);
            done(err);
          }
          else{
            let obj = JSON.parse(res.text);
            obj.data.email.should.exist;
            obj.data.code.should.exist;
            global.code = obj.data.code; // <============== global.code
            done();
          }
        });
  });
});


describe('POST /me --> 01_user.js', function() {
  it('gets or creates a new user w/code', function(done) {
      this.timeout(6000);
      global.server
        .post('/me')
        .send({email:global.email, code:global.code})
        .timeout(5000)
        .expect(200)
        .end(function(err, res){
          if (err) {
            console.log(err);
            done(err);
          }
          else{
            let obj = JSON.parse(res.text);
            res.status.should.equal(200);
            obj.user.email.should.exist;
            obj.user.token.should.exist;
            global.token = obj.user.token; // <============== global.code
            done();
          }
        });
  });
});


describe('GET /user --> 01_user.js', function () {
  it('gets a user using the JWT token', function (done) {
    this.timeout(6000);
    global.server
      .get('/user')
      .set('Authorization', 'Bearer ' + token)
      .timeout(5000)
      .expect(200)
      .end(function (err, res) {
        if (err) {
          console.log(err);
          DOMPointReadOnly(err);
        }
        else{
          let obj = JSON.parse(res.text);
          res.status.should.equal(200);
          obj.user.email.should.exist;
          obj.user.token.should.exist;
          global.token = obj.user.token; // <============== global.token
          done();
        }
      });
  });
});





