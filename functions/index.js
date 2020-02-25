const functions = require('firebase-functions');
const express = require('express')
const path = require('path')
const app = express()

exports.httpReq = functions.https.onRequest(app)

app.use(express.urlencoded({extended: false})) //middleware to read data from POST
app.use('/public', express.static(path.join(__dirname, 'static')))

//set template engine
app.set('view engine', 'ejs')
//location of ejs
app.set('views', './ejsviews')

function frontEndHandler(req, res){
    res.sendFile(path.join(__dirname + '/prodadmin/prodadmin.html'))
}

app.get('/login', frontEndHandler);
app.get('/home', frontEndHandler);
app.get('/add', frontEndHandler);
app.get('/show', frontEndHandler);

const firebase = require('firebase')

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAJanimYCwnXWtgpYHjueOE_vpMrkrA8os",
    authDomain: "jonathantrinhh-wsp20.firebaseapp.com",
    databaseURL: "https://jonathantrinhh-wsp20.firebaseio.com",
    projectId: "jonathantrinhh-wsp20",
    storageBucket: "jonathantrinhh-wsp20.appspot.com",
    messagingSenderId: "724548411740",
    appId: "1:724548411740:web:54ee964bc74ca1e461a199"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  const Constants = require('./myconstants.js')

app.get('/', auth, async (req, res) => {
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        let products = []
        const snapshot = await coll.orderBy("name").get()
        snapshot.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        res.render('storefront.ejs', {error: false, products, user: req.user})
    } catch (e){
        res.render('storefront.ejs', {error: e, user: req.user})
    }
})

app.get('/b/about', auth, (req, res) => {
    res.render('about.ejs', {user: req.user})
})
app.get('/b/contact', auth, (req, res) => {
    res.render('contact.ejs', {user: req.user})
})
app.get('/b/signin', (req, res) => {
    res.render('signin.ejs', {error: false, user: req.user})
})

app.post('/b/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        const user = await auth.signInWithEmailAndPassword(email, password)
        res.redirect('/')
    } catch (e) {
        res.render('signin', {error: e, user: req.user})
    }
})

app.get('/b/signout', async (req, res) => {
    try{
        await firebase.auth().signOut()
        res.redirect('/')
    } catch (e) {
        res.send('Error: sign out')
    }
})

app.get('/b/profile', auth, (req, res) => {
    if(!req.user){
        res.redirect('/b/signin')
    } else {
        res.render('profile', {user: req.user})
    }
})

//middleware
function auth(req, res, next){
    req.user = firebase.auth().currentUser
    next()
}

app.get('/testlogin', (req, res) => {
    res.sendFile(path.join(__dirname, '/static/html/login.html'))
})

app.post('/testsignIn', (req, res) => {
    const email = req.body.email
    const password = req.body.pass
    // let page = `
    //     (POST) You entered: ${email} and ${password}
    // `;
    // res.send(page)
    const obj = {
        a: email,
        b: password,
        c: '<h1>login success</h1>',
        d: '<h1>login success</h1>',
        start: 1,
        end: 10
    }
    res.render('home', obj)
})

app.get('/testsignIn', (req, res) => {
    const email = req.query.email
    const password = req.query.pass
    let page = `
        You entered: ${email} and ${password}
    `;
    res.send(page)
})

app.get('/test', (req, res) => {
    const time = new Date().toString()
    let page = `
        <h1>Current Time At Server: ${time}</h1>
    `;
    res.header('refresh', 1)
    res.send(page)
})

app.get('/test2', (req, res) => {
    res.redirect('http://www.uco.edu')
})