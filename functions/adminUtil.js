
var admin = require("firebase-admin");

var serviceAccount = require("./jonathantrinhh-wsp20-firebase-adminsdk-m3n5l-8e313cd3b5.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://jonathantrinhh-wsp20.firebaseio.com"
});

const Constants = require('./myconstants.js')
var nodemailer = require('nodemailer')


async function createUser(req, res){
  const email = req.body.email
  const password = req.body.password
  const displayName = req.body.displayName
  const phoneNumber = req.body.phoneNumber
  const photoURL = req.body.photoURL

  try{
      await admin.auth().createUser(
        {email, password, displayName, phoneNumber, photoURL}
      )

      link = await admin.auth().generateEmailVerificationLink(email)
      sendVerificationLink(email, link)

      res.render('signin.ejs', {page: 'signin', user: false, error: 'Account created! Please check your email for a verification link.'})
  } catch(e) {
      res.render('signup.ejs', {error: e, user: false, page: 'signup'})
  }
}

async function listUsers(req, res){
  try{
      const userRecord = await admin.auth().listUsers()
      res.render('admin/listUsers.ejs', {users: userRecord.users, error: false})
  } catch (e) {
      res.render('admin/listUsers.ejs', {users: false, error: e})
  }
}

async function verifyIdToken(idToken){
  try{
      const decodedIdToken = await admin.auth().verifyIdToken(idToken)
      return decodedIdToken
  } catch(e) {
      return null
  }
}

async function getOrderHistory(decodedIdToken){
  try{
    const collection = admin.firestore().collection(Constants.COLL_ORDERS)
    let orders = []
    const snapshot = await collection.where("uid", "==", decodedIdToken.uid).orderBy("timestamp").get()
    snapshot.forEach(doc => {
        orders.push(doc.data())
    })
      return orders
  } catch(e){
      return null
  }
}

async function checkOut(data){
  data.timestamp = admin.firestore.Timestamp.fromDate(new Date())
  try{
      const collection = admin.firestore().collection(Constants.COLL_ORDERS)
      await collection.doc().set(data)
  } catch(e) {
      throw e
  }
}

async function sendInvoice(req, res){

  try{
    const userRecord = await admin.auth().getUserByEmail(req.decodedIdToken.email)
    if(userRecord.emailVerified){
      let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'webserver2020jh@gmail.com',
            pass: 'WSP2020!'
        }
      })
      
      let cart = req.session.cart
      let totalPrice = 0
    
      let message = (
        `
        <h1>Thank you! Your order has been received.</h1>
        <table style="border: 2px solid #333;"> 
        <tr>
          <th></th>
          <th>Product</th>
          <th>Quantity</th>
          <th>Price</th>
        </tr>`
      )
    
      cart.forEach((item) => {
        message += 
        `<tr>
          <td><img src="${item.product.image_url}" style="width: 100px"></td>
          <td>${item.product.summary}</td>
          <td>${item.qty}</td>
          <td>${item.product.price}</td>
        </tr>`
      })
    
      cart.forEach((item) => {
        totalPrice += (item.product.price * item.qty)
      })
    
      message += `<tr style="font-size:15px">Total:</tr>
        <td style="font-size:30px">${totalPrice.toFixed(2)}</td>
        </table>
      `
      
      let mailOptions = {
        from: 'Web Server 2020 <webserver2020jh@gmail.com>',
        to: req.decodedIdToken.email,
        subject: 'Invoice - Web Server 2020',
        html: message
      }
      transporter.sendMail(mailOptions)
    }
    else{
      console.log("Email not verified, no invoice sent.")
    }
  } catch (e) {
    console.log('Error fetching user data:', e)
  }
}

function sendVerificationLink(email, link){
    
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'webserver2020jh@gmail.com',
        pass: 'WSP2020!'
    }
  })

  let mailOptions = {
    from: 'Web Server 2020 <webserver2020jh@gmail.com>',
    to: email,
    subject: 'Email Verification - Web Server 2020',
    text: link
  }

  transporter.sendMail(mailOptions)
}

module.exports = {
  createUser,
  listUsers,
  verifyIdToken,
  getOrderHistory,
  checkOut,
  sendInvoice,
}