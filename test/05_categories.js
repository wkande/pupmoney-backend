
var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
var server = supertest.agent(url);


describe('GET /categories --> 05_categories.js', function () {
    it('gets a list of categories', function (done) {
        server
            .get('/categories?q=&dttmStart=2010-01-02&dttmEnd=2020-01-02')
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.categories.should.exist;
                    global.category_id = obj.categories[0].id; // <============== global.category_id
                    done();
                }
            });
    });
});


describe('GET /categories/:cat_id --> 05_categories.js', function () {
    it('get a category', function (done) {
        server
            .get('/categories/'+global.category_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    let obj = JSON.parse(res.text);
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});



describe('POST /categories --> 05_categories.js', function () {
    it('post a category', function (done) {
        server
            .post('/categories')
            .send({'name':'My new category'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(201)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(201);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(201);
                    obj.category.id.should.exist;
                    global.temp_category_id = obj.category.id; // <============== global.temp_category_id
                    done();
                }
            });
    });
});



describe('PATCH /categories/:cat_id/name --> 05_categories.js', function () {
    it('patch a category name', function (done) {
        server
            .patch('/categories/'+global.temp_category_id+'/name')
            .send({'name':'My new categgory name'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});


describe('PATCH /categories/:cat_id/vendors --> 05_categories.js', function () {
    it('patch a category vendor array', function (done) {
        server
            .patch('/categories/'+global.temp_category_id+'/vendors')
            .send({'vendors':'{"One", "Two"}'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});



describe('DELETE /categories/:cat_id --> 05_categories.js', function () {
    it('delete a category', function (done) {
        server
            .delete('/categories/'+global.temp_category_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    done();
                }
            });
    });
});

