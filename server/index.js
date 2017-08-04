const express = require('express');

const routes = require('./routes');

const app   = express();
const path  = require('path');
const port= process.env.PORT || 3000; //require('../src/actions/apis').PORT;

app.use(express.static('static'));

app.use('/public', express.static(path.join(__dirname, '../public')));
app.use('/api', routes);
app.get('*', function (request, response){ response.sendFile(path.resolve(__dirname, '../', 'index.html')) });

const server = app.listen(port, () => {
  const port = server.address().port;
  console.log('nodegit server running on ', port);
});

module.exports = server;
