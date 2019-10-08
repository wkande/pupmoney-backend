var should = require("should");


describe('GET /wallets --> 02_wallets.js', function () {
    it('gets a list of wallets', function (done) {
        global.server
            .get('/wallets')
            .set('Authorization', 'Bearer ' + global.token)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.wallets.should.exist;
                    global.wallet = obj.wallets[0]; // <============== global.wallet #1
                    done();
                }
            });
    });
});


describe('GET /wallet/:id --> 02_wallets.js', function () {
    it('gets a wallet', function (done) {
        global.server
            .get('/wallets/'+global.wallet.id)
            .set('Authorization', 'Bearer ' + global.token)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    obj.wallet.id.should.exist;
                    done();
                }
            });
    });
});


describe('POST /wallet --> 02_wallets.js', function () {
    it('post a wallet', function (done) {
        global.server
            .post('/wallets')
            .send({ 'name':'My new wallet', 
                    'shares':'{}', 
                    'currency':'{"curId": 2, "symbol": "", "decimal": ".", "precision": 2, "separator": ","}'
            })
            .set('Authorization', 'Bearer ' + global.token)
            .set('Content-Type', 'application/x-www-form-urlencoded')
            .expect(201)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {
                    console.log(err); 
                    done(err);
                }
                else{
                    res.status.should.equal(201);
                    obj.wallet.should.exist;
                    global.temp_wallet_id = obj.wallet.id; // <============== global.temp_wallet_id
                    done();
                }
            });
    });
});


describe('PATCH /wallets/:id --> 02_wallet.js', function () {
    it('patch name and shares on a wallet id: ', function (done) {
        let body = {};
        global.server
            .patch('/wallets/'+global.temp_wallet_id)
            .send({ 'name':'My new wallet name', 
                    'shares':'{1,2,4}',
                    'currency':'{"curId": 2, "symbol": "", "decimal": ".", "precision": 2, "separator": ","}'
            })
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
                    obj.wallet.should.exist;
                    done();
                }
            });
    });
});

describe('PATCH /wallets/:id/currency --> 02_wallet.js', function () {
    it('patch currency on a wallet id: ', function (done) {
        let body = {};
        global.server
            .patch('/wallets/'+global.temp_wallet_id+'/currency')
            .send({ 'currency':'{"curId": 2, "symbol": "", "decimal": ".", "precision": 2, "separator": ","}'
            })
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
                    obj.wallet.should.exist;
                    done();
                }
            });
    });
});


describe('DELETE /wallet --> 02_wallets.js', function () {
    it('delete a wallet', function (done) {
        global.server
            .delete('/wallets/'+global.temp_wallet_id)
            .set('Authorization', 'Bearer ' + global.token)
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
