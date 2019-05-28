// https://codeforgeek.com/2015/07/unit-testing-nodejs-application-using-mocha/

var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
var server = supertest.agent(url);
var email = process.env.PUP_TEST_EMAIL;



console.log("\n++++++++++++++ START TESTS +++++++++++++++++")
describe("GET /ping --> 01_user.js ", function () {
  it("access ping", function (done) {
    server
      .get("/ping")
      .expect(200)
      .end(done);
  });
});


describe('POST /code --> 01_user.js', function() {
  it('sends a code to a user\'s email', function(done) {
      server
        .post('/code')
        .send({email:email})
        .expect(201)
        .end(function(err,res){
          let obj = JSON.parse(res.text);
          if (err) {
            console.log(err); 
            done(err);
          }
          else{
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
      server
        .post('/me')
        .send({email:email, code:global.code})
        .expect(200)
        .end(function(err,res){
          let obj = JSON.parse(res.text);
          if (err) {
            console.log(err);
            done(err);
          }
          else{
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
    server
      .get('/user')
      .set('Authorization', 'Bearer ' + token)
      .expect(200)
      .end(function (err, res) {
        let obj = JSON.parse(res.text);
        if (err) {
          console.log(err);
          done(err);
        }
        else{
          res.status.should.equal(200);
          obj.user.email.should.exist;
          obj.user.token.should.exist;
          global.token = obj.user.token; // <============== global.token
          done();
        }
        
      });
  });
});





