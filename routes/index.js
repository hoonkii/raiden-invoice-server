var express = require('express');
var instapayReq = require('../payreq.js')
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/invoices', function(req, res){
  console.log(req.param("price"))
  var price = req.param("price")

  price = price * 100000
  var unixTime = Math.round(+new Date()/1000)
  var encoded = instapayReq.encode({
    "satoshis": price,
    "timestamp": unixTime,
    "tags": [
      {
        "tagName": "payee_node_key",
        "data": "78902c58006916201F65f52f7834e467877f0500"
      },
      {
        "tagName": "expire_time",
        "data": 3600
      }
    ]
  })
  var privateKeyHex = '3038465f2b9be0048caa9f33e25b5dc50252f04c078aaddfbea74f26cdeb9f3c'
  var signed = instapayReq.sign(encoded, privateKeyHex)

  res.status(200)
  res.format({
    'application/json': function () {
      res.send({ invoice: signed['paymentRequest'] })
    }
  })

});

module.exports = router;
