var express = require('express')
var raidenReq = require('../payreq.js')
var router = express.Router()
var http = require('http')

var token_address = ''
var host = 'http://localhost'
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
        'data': '8ce6Bd1D953F0a0e71F0E97E57C379Ac4b2AA1D3'
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
  var payee_node_address = decoded['tag']['payee_node_key']
  var path = base_url.concat('api/v1/payments/', token_address, '/', payee_node_address)

  var options = {
    hostname: base_url,
    path: path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: {
      'amount': price
    }
  }

  var request = http.request(options, function (res) {
    console.log('Status: ' + res.statusCode)
    console.log('Headers: ' + JSON.stringify(res.headers))
    res.setEncoding('utf8')
    res.on('data', function (body) {
      if (res.statusCode !== 200) {
        console.log('Error')
        response.status(res.statusCode)
        response.format({
            'application/json': function () {
              response.send({
                success: false,
                error: 'error message'
              })
            }
          }
        )
        response.end()
      } else {
        response.format({
          'application/json': function () {
            response.send({success: true})
            response.end()
          }
        })
      }
    })
  })
  request.end()
})

module.exports = router
