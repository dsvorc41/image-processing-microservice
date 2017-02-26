const express = require('express');
const bodyParser = require('body-parser');
const requestHandler = require('./requestHandler');

const app = express();
app.use(bodyParser.urlencoded({ limit: '5mb', extended: true }));

app.use(bodyParser.json({ limit: '50mb', type: 'application/json' }));
app.use(bodyParser.json());

app.get('/imageMockRoute', (req, res) => {
  requestHandler.landing(req, res);
});

app.post('/setImage', (req, res) => {
  requestHandler.setImage(req, res);
});
app.post('/compareImage', (req, res) => {
  requestHandler.compareImage(req, res);
});

const port = process.env.PORT || 8084;

app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`);
});

