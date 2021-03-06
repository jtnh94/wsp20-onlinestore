let pageNum = 1

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
    res.sendFile(path.join(__dirname , '/prodadmin/prodadmin.html'))
}

app.get('/login', frontEndHandler);
app.get('/home', frontEndHandler);
app.get('/add', frontEndHandler);
app.get('/show', frontEndHandler);

const session = require('express-session')
app.use(session(
    {
        secret: 'anysecretstring.asfkha!',
        name:'__session',
        saveUninitialized: false,
        resave: false,
        secure: true,
        maxAge: 1000*60*60*2, // 1000ms -> 1 min -> 1 hour -> 2 hours
        rolling: true, // reset maxAge at every response
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

  const adminUtil = require('./adminUtil.js')
  const Constants = require('./myconstants.js')


app.get('/', auth, async (req, res) => {
    // console.log('==========', req.decodedIdToken ? req.decodedIdToken.email : 'no user')
    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)
    pageNum = 1

    try{
        let products = []
        const snapshot = await coll.orderBy("name").limit(10).get()
        snapshot.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: false, products, user: req.decodedIdToken, cartCount, pageNum})
    } catch (e){
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: e, user: req.decodedIdToken, cartCount})
    }
})

app.get('/b/next', auth, async (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)

    let page, currentPage

    page = await coll.orderBy("name").limit(35).get()

    pageNum = pageNum + 1

    if(pageNum === 1){
        page = await coll.orderBy("name").limit(10).get()
        currentPage = page.docs[page.docs.length - 1]
        let products = []
        const snapshot2 = await coll.orderBy("name").limit(10).get()
        snapshot2.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        return
    }
    else if(pageNum === 2){
        currentPage = page.docs[page.docs.length - 26]
    }
    else if(pageNum === 3){
        currentPage = page.docs[page.docs.length - 16]
    }
    else if(pageNum === 4){
        currentPage = page.docs[page.docs.length - 6]
    }
    else{
        pageNum = 1
        page = await coll.orderBy("name").limit(10).get()
        currentPage = page.docs[page.docs.length - 1]
        let products = []
        const snapshot2 = await coll.orderBy("name").limit(10).get()
        snapshot2.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        return
    }

    try{
        let products = []
        let snapshot = await coll.orderBy("name").startAfter(currentPage).limit(10).get()
        snapshot.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })

        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: false, products, user: req.decodedIdToken, cartCount, pageNum})
    } catch (e){
        res.setHeader('Cache-Control', 'private');  
        res.render('storefront.ejs', {error: e, user: req.decodedIdToken, cartCount})
    }
})

app.get('/b/prev', auth, async (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    const coll = firebase.firestore().collection(Constants.COLL_PRODUCTS)

    let page, currentPage

    page = await coll.orderBy("name").limit(35).get()

    pageNum = pageNum - 1
    if(pageNum > 4 || pageNum < 1){
        pageNum = 1
        try{
            let products = []
            const snapshot2 = await coll.orderBy("name").limit(10).get()
            snapshot2.forEach(doc => {
                products.push({id: doc.id, data: doc.data()})
            })
            res.setHeader('Cache-Control', 'private');
            res.render('storefront.ejs', {error: false, products, user: req.decodedIdToken, cartCount, pageNum})
        } catch (e){
            res.setHeader('Cache-Control', 'private');  
            res.render('storefront.ejs', {error: e, user: req.decodedIdToken, cartCount})
        }
        return
    }
    else if(pageNum === 2){
        currentPage = page.docs[page.docs.length - 26]
    }
    else if(pageNum === 3){
        currentPage = page.docs[page.docs.length - 16]
    }
    else if(pageNum === 4){
        currentPage = page.docs[page.docs.length - 6]
    }
    else{
        pageNum = 1
        page = await coll.orderBy("name").limit(10).get()
        currentPage = page.docs[page.docs.length - 1]
        let products = []
        const snapshot2 = await coll.orderBy("name").limit(10).get()
        snapshot2.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
    }

    console.log("pageNum: ", pageNum)

    try{
        let products = []
        const snapshot2 = await coll.orderBy("name").startAfter(currentPage).limit(10).get()
        snapshot2.forEach(doc => {
            products.push({id: doc.id, data: doc.data()})
        })
        res.setHeader('Cache-Control', 'private');
        res.render('storefront.ejs', {error: false, products, user: req.decodedIdToken, cartCount, pageNum})
    } catch (e){
        res.setHeader('Cache-Control', 'private');  
        res.render('storefront.ejs', {error: e, user: req.decodedIdToken, cartCount})
    }
})

app.get('/b/about', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('about.ejs', {user: req.decodedIdToken, cartCount})
})
app.get('/b/contact', auth, (req, res) => {
    const cartCount = req.session.cart ? req.session.cart.length : 0
    res.setHeader('Cache-Control', 'private');
    res.render('contact.ejs', {user: req.decodedIdToken, cartCount})
})
app.get('/b/signin', (req, res) => {
    res.setHeader('Cache-Control', 'private');
    res.render('signin.ejs', {error: false, user: req.decodedIdToken, cartCount: 0})
})

app.post('/b/signin', async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const auth = firebase.auth()
    try{
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.NONE)
        const userRecord = await auth.signInWithEmailAndPassword(email, password)
        const idToken = await userRecord.user.getIdToken()
        req.session.idToken = idToken

        if(userRecord.user.email === Constants.SYSADMINEMAIL){
            res.setHeader('Cache-Control', 'private');
            res.redirect('/admin/sysadmin')
        }
        else{
            if(!req.session.cart){
                console.log(userRecord.user.emailVerified)
                res.setHeader('Cache-Control', 'private');
                res.redirect('/')
            }
            else{
                res.setHeader('Cache-Control', 'private');
                res.redirect('/b/shoppingcart')
            }
        }
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.render('signin', {error: e, user: null, cartCount: 0})
    }
})

app.get('/b/signout', async (req, res) => {

    req.session.destroy(err => {
        if(err){
            console.log('==== session.destroy error: ', err)
            req.session = null
            res.send('Error: sign out (session.destroy error')
        }
        else{
            res.redirect('/')
        }
    })
})

app.get('/b/profile', authAndRedirectSignIn, (req, res) => {
        const cartCount = req.session.cart ? req.session.cart.length : 0
        // console.log('============ decodedIdToken', req.decodedIdToken)
        res.setHeader('Cache-Control', 'private');
        res.render('profile', {user: req.decodedIdToken, cartCount, orders: false})
})

app.get('/b/signup', (req, res) => {
    res.render('signup.ejs', {page: 'signup', user: null, error: false, cartCount: 0})
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
        res.setHeader('Cache-Control', 'private');
        res.redirect('/b/shoppingcart')
    } catch (e) {
        res.setHeader('Cache-Control', 'private');
        res.send(JSON.stringify(e))
    }
})

app.get('/b/shoppingcart', authAndRedirectSignIn, (req, res) => {
    let cart
    if(!req.session.cart){
        cart = new ShoppingCart()
    }
    else{
        cart = ShoppingCart.deserialize(req.session.cart)
    }
    res.setHeader('Cache-Control', 'private');
    res.render('shoppingcart.ejs', {message: false, cart, user: req.decodedIdToken, cartCount: cart.contents.length})
})

app.post('/b/checkout', authAndRedirectSignIn, async (req, res) => {
    if(!req.session.cart){
        res.setHeader('Cache-Control', 'private');
        return res.send('Shopping cart is empty!')
    }

    //storing order history into firestore
    //collection: orders
    //{uid, timestamp, cart} 
    //cart = [{product, qty} ....]

    const data = {
        uid: req.decodedIdToken.uid,
        // timestamp: firebase.firestore.Timestamp.fromDate(new Date()),
        cart: req.session.cart
    }

    try{
        await adminUtil.checkOut(data)
        await adminUtil.sendInvoice(req, res)
        req.session.cart = null;

        res.setHeader('Cache-Control', 'private');
        return res.render('shoppingcart.ejs', {message: 'Checked out successfully!', cart: new ShoppingCart(), user: req.decodedIdToken, cartCount: 0})
        
    } catch (e) {
        const cart = ShoppingCart.deserialize(req.session.cart)
        res.setHeader('Cache-Control', 'private');
        return res.render('shoppingcart.ejs', {message: 'Check out failed. Try again later!', cart, user: req.decodedIdToken, cartCount: cart.contents.length})
    }
})

app.get('/b/orderhistory', authAndRedirectSignIn, async (req, res) => {
    try{
        const orders = await adminUtil.getOrderHistory(req.decodedIdToken)
        // const collection = firebase.firestore().collection(Constants.COLL_ORDERS)
        // let orders = []
        // const snapshot = await collection.where("uid", "==", req.user.uid).orderBy("timestamp").get()
        // snapshot.forEach(doc => {
        //     orders.push(doc.data())
        // })
        res.setHeader('Cache-Control', 'private');
        res.render('profile.ejs', {user: req.decodedIdToken, cartCount: 0, orders})
    } catch (e) {
        console.log('===========', e)
        res.setHeader('Cache-Control', 'private');
        res.send('<h1>Order History Error</h1>')
    }
})

//middleware

async function authAndRedirectSignIn(req, res, next){
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if(decodedIdToken.uid) {
            req.decodedIdToken = decodedIdToken
            return next()
        }
    } catch(e) {
        console.log('==== authAndRedirect error', e)
    }

    res.setHeader('Cache-Control', 'private');
    return res.redirect('/b/signin')
}

async function auth(req, res, next){

    try{
        if (req.session && req.session.idToken){
            const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
            req.decodedIdToken = decodedIdToken
        }
        else{
            req.decodedIdToken = null
        }
    } catch (e) {
        req. decodedIdToken = null
    }

    next()
}



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

async function authSysAdmin(req, res, next) {
    try{
        const decodedIdToken = await adminUtil.verifyIdToken(req.session.idToken)
        if(!decodedIdToken || !decodedIdToken.email || decodedIdToken.email !== Constants.SYSADMINEMAIL){
            return res.send("<h1>System Admin Page: Access Denied!</h1>")
        }
        if(decodedIdToken.uid){
            req.decodedIdToken = decodedIdToken
            return next()
        }
        return res.send("<h1>System Admin Page: Access Denied!</h1>")
    } catch(e) {
        return res.send("<h1>System Admin Page: Access Denied!</h1>")
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