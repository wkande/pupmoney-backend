var should = require("should");


describe('GET /expenses --> 06_expensess.js', function () {
    it('gets a list of expenses by category_id', function (done) {
        global.server
            .get('/categories/'+global.category_id+'/expenses/?q=&dttmStart=2014-01-23&dttmEnd=2039-12-12&offset=0')
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.expenses.should.exist;
                    if(obj.expenses.length == 0)
                    {
                        done(new Error('get expenses for category_id: (' +global.category_id+ ') NO EXPENSES FOUND'));
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
        global.server
            .get('/categories/'+global.category_id+'/expenses/'+global.expense_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.expense.id.should.exist;
                    done();
                }
            });
    });
});



describe('POST /expenses --> 06_expenses.js', function () {
    it('post an expense', function (done) {
        global.server
            .post('/categories/'+global.category_id+'/expenses/')
            .send({'note':'mynote', 'vendor':'K-Mart', 'amt':433.90, dttm:'2014-02-01'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
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
        global.server
            .put('/categories/'+global.category_id+'/expenses/'+global.temp_expense_id)
            .send({'cat_id':global.category_id, 'note':'mynote again', 'vendor':'Sears','amt':290.34, dttm:'2016-03-01'})
            .set('wallet', JSON.stringify(global.wallet))
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.expense.id.should.exist;
                    done();
                }
            });
    });
});



describe('DELETE /expenses/:exp_id --> 06_expenses.js', function () {
    it('delete an expense', function (done) {
        global.server
            .delete('/categories/'+global.category_id+'/expenses/'+global.temp_expense_id)
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
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


/**
 * Text search for expenses in all categories within a wallet.
 */
describe('GET /expenses/context --> 06_expensess.js', function () {
    it('gets a list of expenses by text search', function (done) {
        global.server
            .get('/expenses/context?q=rei&skip=0')
            .set('Authorization', 'Bearer ' + global.token)
            .set('wallet', JSON.stringify(global.wallet))
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.expenses.should.exist;
                    done();
                }
            });
    });
});