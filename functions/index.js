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

const session = require('express-session')
app.use(session(
    {
        secret: 'anysecretstring.asfkha!',
        saveUninitialized: false,
        resave: false
    }
))

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
        const userRecord = await auth.signInWithEmailAndPassword(email, password)
        if(userRecord.user.email === Constants.SYSADMINEMAIL){
            res.redirect('/admin/sysadmin')
        }
        else{
            res.redirect('/')
        }
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

app.get('/b/signup', (req, res) => {
    res.render('signup.ejs', {page: 'signup', user: null, error: false})
})

const ShoppingCart = require('./model/ShoppingCart.js')

app.post('/b/add2cart', async (req, res) => {
    const id = req.body.docId
    const collection = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    try{
        const doc = await collection.doc(id).get()
        let cart
        if(!req.session.cart){
            //first time adding to cart
            cart = new ShoppingCart()
        }
        else{
            //recover shopping cart
            cart = ShoppingCart.deserialize(req.session.cart)
        }
        const {name, price, summary, image, image_url} = doc.data()
        cart.add({id, name, price, summary, image, image_url})
        req.session.cart = cart.serialize()
        res.redirect('/b/shoppingcart')
    } catch (e) {
        res.send(JSON.stringify(e))
    }
})

app.get('/b/shoppingcart', (req, res) => {
    let cart
    if(!req.session.cart){
        cart = new ShoppingCart()
    }
    else{
        cart = ShoppingCart.deserialize(req.session.cart)
    }
    res.send(JSON.stringify(cart.contents))
})

//middleware
function auth(req, res, next){
    req.user = firebase.auth().currentUser
    next()
}

const adminUtil = require('./adminUtil.js')

// admin API
app.post('/admin/signup', (req, res) => {
    return adminUtil.createUser(req,res)
})

app.get('/admin/sysadmin', authSysAdmin, (req, res) => {
    res.render('admin/sysadmin.ejs')
})

app.get('/admin/listUsers', authSysAdmin, (req, res) => {
    return adminUtil.listUsers(req, res)
})

function authSysAdmin(req, res, next) {
    const user = firebase.auth().currentUser
    if(!user || !user.email || user.email !== Constants.SYSADMINEMAIL){
        res.send("<h1>System Admin Page: Access Denied!</h1>")
    }
    else{
        next()
    }
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