const express = require('express')
const cors = require('cors')
const app = express()
const port = 3000

const fs = require('fs');
const path = require('path')
var _ = require('lodash')

// Create https server
const https = require('https');

// Allow cors for development purpose
app.use(cors())

require('./routes/routes')(app)

// Get index.html 
app.use(express.static(path.join(__dirname, 'public')))

// Https keys
const options = {
  key: fs.readFileSync('d:/privkey.pem'),
  cert: fs.readFileSync('d:/fullchain.pem')
};

var httpsServer = https.createServer(options, app)
httpsServer.listen(port)