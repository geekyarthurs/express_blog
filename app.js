//Express
const express = require('express')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const flash = require('connect-flash')




const app = express()
let sessionOptions = session({
    secret: "Javascript is fucking awesome bitch",
    resave: false,
    store: new MongoStore({client: require('./db') }),
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24
    }
})
app.use(sessionOptions)
app.use(flash())


app.use(function(req,res, next) {
    res.locals.user = req.session.user
    next()
})

//Accepting Submitted Datas
app.use(express.urlencoded({
    extended: false
}))
app.use(express.json())


//Router
const router = require("./router")
app.use('/', router)



//Static Files
app.use(express.static('public'))

//Views
app.set('views', 'views')
app.set('view engine', 'ejs')


//Starting App
module.exports = app