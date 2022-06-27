const express = require('express')
const app = express()
const path = require('path')
const bodyParser = require('body-parser')
const adminRoutes = require('./routes/route-admin')
const userRoutes = require('./routes/route-shop')
const accountRoutes = require('./routes/route-account')
const errorsController = require('./controllers/controller-errors')
const PORT = process.env.PORT || 3000

// Mongoose
const mongoose = require('mongoose')
const connectionString = 'mongodb+srv...'
const cookieParser = require('cookie-parser')
const session = require('express-session')
const mongoDbStore = require('connect-mongodb-session')(session)
var store = new mongoDbStore({
    uri: connectionString,
    collection: 'mySessions'
})
const csurf = require('csurf')

app.use(cookieParser())
app.use(session({
    secret: 'Keyboard cat',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 3600000
    },
    store: store
}))

// Users models
const User = require('./models/model-user')

// Pug views engine
app.set('view engine', 'pug')
app.set('views', './views')

// npm i body-parser
app.use(bodyParser.urlencoded({ extended: false }))

// file upload support
const multer = require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/img/products/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({ storage: storage })
app.use(upload.single('image'))


// Set the static folder
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    if (!req.session.user){
        return next()
    }

    User.findById(req.session.user._id)
        .then(user =>{
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

app.use(csurf())

// Routes
app.use('/admin', adminRoutes)
app.use(userRoutes)
app.use(accountRoutes)

// 500 error page
app.use('/500', errorsController.get500Page)
// 404 not found
app.use(errorsController.get404Page)
// Error Page middleware
app.use((error, req, res, next)=>{
    console.log(error)
    res.status(500).render('errors/500', {title: 'Error'})
})

/*
 * Mongoose Connect
======================================*/
mongoose.connect(connectionString)
    .then(()=>{
        console.log('connected mongodb')
        app.listen(PORT)
    })
    .catch(err => console.log(err))
