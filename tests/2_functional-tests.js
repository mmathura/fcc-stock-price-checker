/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
         //complete this one too
         // console.log(res.body); 
         // console.log(res.body.stockData.stock);
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         assert.equal(res.body.stockData.stock, 'GOOG');
         assert.property(res.body, 'stockData');
         assert.property(res.body.stockData, 'stock');
         assert.property(res.body.stockData, 'price');
         assert.property(res.body.stockData, 'likes');
         done();
        });
      });
      
      test('1 stock with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aig+', like: 'true'})
        .end(function(err, res){
         // console.log(res.body); 
         // console.log(res.body.stockData.stock);
         // console.log(res.body.stockData.likes);
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         assert.equal(res.body.stockData.stock, 'AIG+');
         assert.isAtLeast(res.body.stockData.likes, 1, 'is greater than or equal to 1');
         assert.property(res.body, 'stockData');
         assert.property(res.body.stockData, 'stock');
         assert.property(res.body.stockData, 'price');
         assert.property(res.body.stockData, 'likes');
         done();
        });     
      });
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'aig+', like: 'true'})
        .end(function(err, res){
         // console.log(res.body); 
         // console.log(res.body.stockData.stock);
         // console.log(res.body.stockData.likes);
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         assert.equal(res.body.stockData.stock, 'AIG+');
         assert.equal(res.body.stockData.likes, 1, 'is equal to 1');
         assert.property(res.body, 'stockData');
         assert.property(res.body.stockData, 'stock');
         assert.property(res.body.stockData, 'price');
         assert.property(res.body.stockData, 'likes');
         done();
        }); 
      });
            
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','aig+']})
        .end(function(err, res){
         // console.log(res.body); 
         // console.log(res.body.stockData.stock);
         // console.log(res.body.stockData.likes);
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         assert.equal(res.body.stockData[0].stock, 'GOOG');
         assert.equal(res.body.stockData[1].stock, 'AIG+');
         assert.equal(res.body.stockData[0].rel_likes, -1, 'is equal to 0'); // 0 - 1
         assert.equal(res.body.stockData[1].rel_likes, 1, 'is equal to 0'); // 1 - 0
         assert.property(res.body, 'stockData');
         assert.isArray(res.body.stockData);
         assert.property(res.body.stockData[0], 'stock');
         assert.property(res.body.stockData[0], 'price');
         assert.property(res.body.stockData[0], 'rel_likes');
         assert.property(res.body.stockData[1], 'stock');
         assert.property(res.body.stockData[1], 'price');
         assert.property(res.body.stockData[1], 'rel_likes');
         done();
        });   
      });
            
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['tsla','aapl'], like: 'true'})
        .end(function(err, res){
         // console.log(res.body); 
         // console.log(res.body.stockData.stock);
         // console.log(res.body.stockData.likes);
         assert.equal(res.status, 200);
         assert.isObject(res.body);
         assert.equal(res.body.stockData[0].stock, 'TSLA');
         assert.equal(res.body.stockData[1].stock, 'AAPL');
         assert.equal(res.body.stockData[0].rel_likes, 0, 'is equal to 0'); // 1 - 1
         assert.equal(res.body.stockData[1].rel_likes, 0, 'is equal to 0'); // 1 - 1 
         assert.property(res.body, 'stockData');
         assert.isArray(res.body.stockData);
         assert.property(res.body.stockData[0], 'stock');
         assert.property(res.body.stockData[0], 'price');
         assert.property(res.body.stockData[0], 'rel_likes');
         assert.property(res.body.stockData[1], 'stock');
         assert.property(res.body.stockData[1], 'price');
         assert.property(res.body.stockData[1], 'rel_likes'); 
         done();
        }); 
      });
      
    });

});
