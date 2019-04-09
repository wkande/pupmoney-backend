
var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
var server = supertest.agent(url);


describe('GET /expenses --> 06_expensess.js', function () {
    it('gets a list of expenses by category_id', function (done) {
        server
            .get('/categories/'+global.category_id+'/expenses/?q=&dttmStart=2014-01-23&dttmEnd=2018-12-12&offset=0')
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
                    obj.expenses.should.exist;
                    if(obj.expenses.length == 0)
                    {
                        done(new Error('add an expense for category_id: (' +global.category_id+ ') to continue testing'));
                    }
                    else{
                        global.expense_id = obj.expenses[0].id;
                        done();
                    } 
                }
            });
    });
});


describe('GET /expense/:exp_id --> 06_expenses.js', function () {
    it('get an expense', function (done) {
        server
            .get('/categories/'+global.category_id+'/expenses/'+global.expense_id)
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
                    obj.expense.id.should.exist;
                    done();
                }
            });
    });
});



describe('POST /expenses --> 06_expenses.js', function () {
    it('post an expense', function (done) {
        server
            .post('/categories/'+global.category_id+'/expenses/')
            .send({'note':'mynote', 'vendor':'K-Mart', 'amt':433.90, dttm:'2014-02-01'})
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
                    obj.expense.id.should.exist;
                    global.temp_expense_id = obj.expense.id;  // <============== global.temp_expense_id
                    done();
                }
            });
    });
});



describe('PUT /expenses/:exp_id --> 06_expenses.js', function () {
    it('put an expense', function (done) {
        // Will use the same cat_id in the body
        server
            .put('/categories/'+global.category_id+'/expenses/'+global.temp_expense_id)
            .send({'cat_id':global.category_id, 'note':'mynote again', 'vendor':'Sears','amt':290.34, dttm:'2016-03-01'})
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
                    obj.expense.id.should.exist;
                    done();
                }
            });
    });
});



describe('DELETE /expenses/:exp_id --> 06_expenses.js', function () {
    it('delete an expense', function (done) {
        server
            .delete('/categories/'+global.category_id+'/expenses/'+global.temp_expense_id)
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


