
var supertest = require("supertest");
var should = require("should");
const url = process.env.PUP_TEST_URL || 'http://192.168.0.14:3000';
var server = supertest.agent(url);


describe('GET /wallets --> 02_wallets.js', function () {
    it('gets a list of wallets', function (done) {
        server
            .get('/wallets')
            .set('Authorization', 'Bearer ' + global.token)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.wallets.should.exist;
                    global.wallet = obj.wallets[0]; // <============== global.wallet #1
                    done();
                }
            });
    });
});


describe('GET /wallet/:id --> 02_wallets.js', function () {
    it('gets a wallet', function (done) {
        server
            .get('/wallets/'+global.wallet.id)
            .set('Authorization', 'Bearer ' + global.token)
            .expect(200)
            .end(function (err, res) {
                let obj = JSON.parse(res.text);
                if (err) {console.log(obj.statusMsg); done(err);}
                else{
                    obj.statusCode.should.equal(200);
                    obj.statusMsg.should.exist;
                    res.status.should.equal(200);
                    obj.wallet.id.should.exist;
                    done();
                }
            });
    });
});


describe('POST /wallet --> 02_wallets.js', function () {
    it('post a wallet', function (done) {
        server
            .post('/wallets')
            .send({ 'name':'My new wallet', 
                    'shares':'{1,2,4}', 
                    'country_code':'en-US', 
                    'currency_options':'{"style": "currency", "currency": "USD", "minimumFractionDigits": 2}'
            })
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
                    obj.wallet.id.should.exist;
                    global.temp_wallet_id = obj.wallet.id; // <============== global.temp_wallet_id
                    done();
                }
            });
    });
});


describe('PATCH /wallets/:id --> 02_wallet.js', function () {
    it('patch name and shares on a wallet id: ', function (done) {
        let body = {};
        server
            .patch('/wallets/'+global.temp_wallet_id)
            .send({ 'name':'My new wallet name', 
                    'shares':'{1,2,4}'
            })
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
                    obj.wallet.id.should.exist;
                    done();
                }
            });
    });
});

describe('PATCH /wallets/:id/currency --> 02_wallet.js', function () {
    it('patch currency on a wallet id: ', function (done) {
        let body = {};
        server
            .patch('/wallets/'+global.temp_wallet_id+'/currency')
            .send({ 'currency':'{"curId": 2, "symbol": "", "decimal": ".", "precision": 2, "separator": ","}'
            })
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
                    obj.wallet.id.should.exist;
                    done();
                }
            });
    });
});


describe('DELETE /wallet --> 02_wallets.js', function () {
    it('delete a wallet', function (done) {
        server
            .delete('/wallets/'+global.temp_wallet_id)
            .set('Authorization', 'Bearer ' + global.token)
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
