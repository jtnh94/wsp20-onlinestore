const functions = require('firebase-functions');
const express = require('express')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.get('/', (req, res) => {
    res.send('<h1>My store (from backend) </h1>')
})

function frontEndHandler(req, res){
    res.sendFile(__dirname + '/prodadmin/prodadmin.html')
}

app.get('/login', frontEndHandler);
app.get('/home', frontEndHandler);
app.get('/add', frontEndHandler);
app.get('/show', frontEndHandler);