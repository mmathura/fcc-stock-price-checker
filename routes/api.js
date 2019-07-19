/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
var request = require('request');

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});
var options = { useNewUrlParser: true }; 

// MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
//   if (err) console.log(err);
//   var db = client.db('stocks');
//   if (db) console.log('Connected to database'); 
// });

module.exports = function (app) {
  
  app.route('/api/stock-prices')
    .get(function (req, res){
      // 2 - I can GET /api/stock-prices with form data containing a Nasdaq stock ticker and recieve back an object stockData.
      // 3 - In stockData, I can see the stock(string, the ticker), price(decimal in string format), and likes(int).
      // {"stockData":{"stock":"GOOG","price":"786.90","likes":1}}
      // 4 - I can also pass along field like as true(boolean) to have my like added to the stock(s). Only 1 like per ip 
      // should be accepted.
      // /api/stock-prices?stock=goog
      // /api/stock-prices?stock=goog&like=true
      // console.log(req.query);
      // console.log(req.ip);
      var symbol = req.query.stock;
      var like = req.query.like;
      var ip = req.ip;
      // console.log(symbol);  
      // console.log(like);
      if (like == 'true') like = 1; else like = 0;
      // console.log(symbol.length);
      if (symbol.length != 2) {
        request("https://api.iextrading.com/1.0/tops/last?symbols=" + encodeURIComponent(symbol), 
          function(error, response, body) {
            if (!error && response.statusCode === 200) {
                // console.log(body);
                var parsedData = JSON.parse(body);
                // console.log(parsedData[0].symbol, parsedData[0].price);
                // console.log(parsedData[0].price.toFixed(2).toString());
                MongoClient.connect(CONNECTION_STRING, options, function(err, client) {
                  if (err) console.log(err);
                  var db = client.db('stocks');
                  // if (db) console.log('Connected to database');  
                  db.collection('quotes').find({stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), ip: ip}).toArray((err, data) => {
                    if (err) return res.json({error: err});
                    // console.log(data[0]);
                    if (data[0]) {
                      // console.log("Matched in database: ");
                      // console.log(data[0]);
                      db.collection('quotes').find({stock: parsedData[0].symbol}).toArray((err, data) => {
                        if(err) return res.json({error: err});
                        var total = 0;
                        if (data) {
                          // console.log(data);
                          data.forEach((s) => {
                            // console.log(s.likes);
                            total += s.likes;
                          });
                        }
                        // console.log("total= " + total);
                        return res.json({stockData: {stock: data[0].stock, price: parsedData[0].price.toFixed(2).toString(), likes: total}});
                      });
                    }
                    else { // insert new stock 
                      var newStock = { stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), likes: like, ip: ip };
                      db.collection('quotes').insertOne(newStock, (err, data) => {
                        var total = 0;
                        if (err) return res.json({error: err});
                        if (data) {
                          db.collection('quotes').find({stock: parsedData[0].symbol}).toArray((err, data) => {
                            if(err) return res.json({error: err});
                            if (data) {
                              // console.log(data);
                              data.forEach((s) => {
                                // console.log(s.likes);
                                total += s.likes;
                              });
                            }
                            // console.log("total= " + total);
                            return res.json({stockData: {stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), likes: total}});
                          });
                        }
                        else
                          return res.send('no stocks exist');
                      });
                    }
                  });
                });
            }
        });
      }
      else {
        // 5 - If I pass along 2 stocks, the return object will be an array with both stock's info 
        // but instead of likes, it will display rel_likes(the difference between the likes on both) on both.
        // 6 - A good way to receive current price is the following external API(replacing 'GOOG' with your stock): 
        // https://finance.google.com/finance/info?q=NASDAQ%3aGOOG
        // {"stockData":[{"stock":"MSFT","price":"62.30","rel_likes":-1},{"stock":"GOOG","price":"786.90","rel_likes":1}]}
        // /api/stock-prices?stock=goog&stock=msft
        // /api/stock-prices?stock=goog&stock=msft&like=true
        // console.log('like= ' + like);
        request("https://api.iextrading.com/1.0/tops/last?symbols=" + encodeURIComponent(symbol[0]) + ',' + 
          encodeURIComponent(symbol[1]), function(error, response, body) { 
            if (!error && response.statusCode === 200) {
              // console.log(body);
              var parsedData = JSON.parse(body);
              // console.log(parsedData[0].symbol, parsedData[0].price, parsedData[1].symbol, parsedData[1].price);
              // console.log(parsedData[0].price.toFixed(2).toString(), parsedData[1].price.toFixed(2).toString());
              MongoClient.connect(CONNECTION_STRING, options, function(err, client) { 
                if (err) console.log(err);
                var db = client.db('stocks');
                // if (db) console.log('Connected to database'); 
                // if stocks don't exist, insert them into db, and set likes to 1
                // first symbol
                db.collection('quotes').find({stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), 
                  ip: ip}).toArray((err, data) => {
                  if (err) return res.json({error: err});
                  // console.log(data);
                  if (!data[0]) { // symbol not found
                    // insert into database
                    db.collection('quotes').insertOne({stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), 
                      likes: like, ip: ip}, (err, data) => {
                        if (err) return res.json({error: err}); 
                        if (!data) return res.send('no stocks exist');
                    });
                  }
                });
                // next symbol
                db.collection('quotes').find({stock: parsedData[1].symbol, price: parsedData[1].price.toFixed(2).toString(), 
                  ip: ip}).toArray((err, data) => {
                    if (err) return res.json({error: err});
                    if (!data[0]) { // symbol not found
                     // insert into database
                     db.collection('quotes').insertOne({stock: parsedData[1].symbol, price: parsedData[1].price.toFixed(2).toString(), 
                       likes: like, ip: ip}, (err, data) => {
                         if (err) return res.json({error: err}); 
                         if (!data) return res.json({error: 'no stocks exist'});
                     });                    
                  }
                  // console.log('In calculate likes for: ', parsedData[0].symbol, parsedData[1].symbol);
                  // calculate likes
                  db.collection('quotes').find({stock: parsedData[0].symbol}).toArray((err, data) => { 
                    if(err) return res.json({error: err});
                    if (data) { 
                      // console.log(data);
                      var total1 = 0;
                      var total2 = 0;
                      data.forEach((s) => {
                        // console.log(s.likes);
                        total1 += s.likes;
                      });
                      db.collection('quotes').find({stock: parsedData[1].symbol}).toArray((err, data) => {
                        if(err) return res.json({error: err});
                        if (data) {
                          // console.log(data);
                          data.forEach((s) => {
                            // console.log(s.likes);
                            total2 += s.likes;
                          }); 
                          // console.log("total1= " + total1);
                          // console.log("total2= " + total2);
                          // calculate rel_likes
                          var rel_likes1 = total1 - total2; // 0 - 1 = -1
                          var rel_likes2 = total2 - total1; // 1 - 0 = 1
                          // console.log("rel_likes1= " + rel_likes1);
                          // console.log("rel_likes2= " + rel_likes2); 
                          return res.json({ stockData: [ {stock: parsedData[0].symbol, price: parsedData[0].price.toFixed(2).toString(), rel_likes: rel_likes1},
                                                         {stock: parsedData[1].symbol, price: parsedData[1].price.toFixed(2).toString(), rel_likes: rel_likes2} ] });
                        }
                      });
                     }
                  });
                });                
              });
            }
        });
      } 
  }); 
};


                                                                                                                                    