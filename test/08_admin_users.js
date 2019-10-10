var should = require("should");


describe('GET /admin/users --> 08_admin_users.js', function () {
    it('gets a list of users', function (done) {
        this.timeout(6000);
        global.server
            .get('/admin/users')
            .set('Authorization', 'Bearer ' + global.token)
            .timeout(5000)
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
