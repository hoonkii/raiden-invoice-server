var express = require('express')
var raidenReq = require('../payreq.js')
var router = express.Router()
var http = require('http')
var request = require('request')

var token_address = '0x4f50C3bCbAC121D1C1f7E2Eee408e63D0F2fc6cB'
var host = 'http://127.0.0.1'
var port = ':5001'
var base_url = host + port
/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', {title: 'Express'})
})

router.get('/invoices', function (req, res) {
  console.log(req.param('price'))
  var price = req.param('price')

  var unixTime = Math.round(+new Date() / 1000)
  var encoded = raidenReq.encode({
    'satoshis': price,
    'timestamp': unixTime,
    'tags': [
      {
        'tagName': 'payee_node_key',
        'data': '19C3a195ae62C4b58c0D7f3519907d564FA084b7'
      },
      {
        'tagName': 'expire_time',
        'data': 3600
      }
    ]
  })
  console.log(encoded)
  var privateKeyHex = '3038465f2b9be0048caa9f33e25b5dc50252f04c078aaddfbea74f26cdeb9f3c'
  var signed = raidenReq.sign(encoded, privateKeyHex)
  console.log(signed)

  res.status(200)
  res.format({
    'application/json': function () {
      res.send({invoice: signed['paymentRequest']})
    }
  })

})

router.post('/payments', function (req, response) {
  console.log(req.param('invoice'))
  var invoice = req.param('invoice')
  var decoded = raidenReq.decode(invoice)

  var price = decoded['satoshis']
  console.log(decoded['tags'][0]['data'])
  var payee_node_address = '0x' + decoded['tags'][0]['data']
  var path = base_url.concat('/api/v1/payments/', token_address, '/', payee_node_address)
  console.log(price)
  console.log(path)
  console.log()

  var options = {
    url: base_url + path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      'amount': price
    }
  }

  request(options, function(error, response, body){
    if(error) console.log("error")
    if(!error && response.statusCode == 200){
      response.send({
        'success':true
      })
    }
    response.send({
      'success':false
    })

  })

})

module.exports = router
