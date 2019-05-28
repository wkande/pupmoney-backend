
var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
var server = supertest.agent(url);


describe('GET /admin/users --> 08_admin_users.js', function () {
    it('gets a list of users', function (done) {
        server
            .get('/admin/users')
            .set('Authorization', 'Bearer ' + global.token)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.users.should.exist;
                    obj.rowCount.should.exist;
                    obj.offset.should.exist;
                    done();
                }
            });
    });
});
