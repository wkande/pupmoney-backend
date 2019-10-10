var should = require("should");


describe('GET /categories --> 05_categories.js', function () {
    it('gets a list of categories', function (done) {
        this.timeout(6000);
        global.server
            .get('/categories?q=&dttmStart=2010-01-02&dttmEnd=2020-01-02')
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .timeout(5000)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.categories.should.exist;
                    global.category_id = obj.categories[0].id; // <============== global.category_id
                    done();
                }
            });
    });
});


describe('GET /categories/:cat_id --> 05_categories.js', function () {
    it('get a category', function (done) {
        this.timeout(6000);
        global.server
            .get('/categories/'+global.category_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .timeout(5000)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});


describe('POST /categories --> 05_categories.js', function () {
    it('post a category', function (done) {
        this.timeout(6000);
        global.server
            .post('/categories')
            .send({'name':'My new category'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .timeout(5000)
            .expect(201)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.category.id.should.exist;
                    global.temp_category_id = obj.category.id; // <============== global.temp_category_id
                    done();
                }
            });
    });
});



describe('PATCH /categories/:cat_id/name --> 05_categories.js', function () {
    it('patch a category name', function (done) {
        this.timeout(6000);
        global.server
            .patch('/categories/'+global.temp_category_id+'/name')
            .send({'name':'My new categgory name'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .timeout(5000)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);}
                else{
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});


describe('PATCH /categories/:cat_id/vendors --> 05_categories.js', function () {
    it('patch a category vendor array', function (done) {
        this.timeout(6000);
        global.server
            .patch('/categories/'+global.temp_category_id+'/vendors')
            .send({'vendors':'{"One", "Two"}'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .timeout(5000)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.category.id.should.exist;
                    done();
                }
            });
    });
});



describe('DELETE /categories/:cat_id --> 05_categories.js', function () {
    it('delete a category', function (done) {
        this.timeout(6000);
        global.server
            .delete('/categories/'+global.temp_category_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .timeout(5000)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    done();
                }
            });
    });
});

