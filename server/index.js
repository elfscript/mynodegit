const express = require('express');

const routes = require('./routes');

const app   = express();
const path  = require('path');
const port= process.env.PORT || 3000; //require('../src/actions/apis').PORT;

app.use(express.static('static'));

app.use(express.static(path.join(__dirname, '../public')));
app.use('/api', routes);

//=== swagger spec =====================
var swaggerJSDoc = require('swagger-jsdoc');

// swagger definition
var swaggerDefinition = {
  info: {
    title: 'Node Swagger API',
    version: '1.0.0',
    description: 'Demonstrating how to describe a RESTful API with Swagger',
  },
  host: 'localhost:'+ port,
  basePath: '/',
};

// options for the swagger docs
var options = {
  // import swaggerDefinitions
  swaggerDefinition: swaggerDefinition,
  // path to the API docs
  apis: ['./routes/index1.js', './routes/index2.js'],
};

// initialize swagger-jsdoc
var swaggerSpec = swaggerJSDoc(options);
console.log(swaggerSpec);
//========================

// serve swagger
app.get('/swagger.json', function(req, res) {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});


app.get('*', function (request, response){ response.sendFile(path.resolve(__dirname, '../public', 'index.html')) });

//=======================
const server = app.listen(port, () => {
  const port = server.address().port;
  console.log('nodegit server running on ', port);
});



module.exports = server;

