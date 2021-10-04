
const join = require('path').join;
const express = require('express');
const port = process.env.PORT || 1235;
const app = express();
const data = require('./data2.json')
let cors = require('cors')
app.use(cors())

app.get('/data1', function (req, res) {
  res.header("Content-Type",'application/json');
  res.send(JSON.stringify(data));
})



app.get('/data2', (req, res) => {
    res.header("Content-Type",'application/json');    
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, Content-Type, X-Auth-Token');
    res.sendFile(join(__dirname, 'data2.json'));
})


app.get('/hello', (req, res) => {
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify({hello:'Hello World'}));
})


app.listen(port);
console.log('Express app started on port ' + port);