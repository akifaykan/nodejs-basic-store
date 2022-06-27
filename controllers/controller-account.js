// Account controllers
const User = require('../models/model-user')
const Login = require('../models/model-login')
const bcrypt = require('bcrypt')
const nodemailer = require('nodemailer')
const crypto = require('crypto')
const Category = require("../models/model-category");

let msg = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: '@gmail.com',
        pass: '***'
    },
    tls: {
        rejectUnauthorized: false
    }
})

exports.getLogin = (req, res, next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage

    res.render('account/login', {
        path: '/login',
        title: 'Login Page',
        errorMessage: errorMessage
    })
}

exports.postLogin = (req, res, next) => {
    const email = req.body.email
    const password = req.body.password

    const loginModel = new Login({
        email: email,
        password: password
    })

    loginModel
        .validate()
        .then(() => {
            User.findOne({ email: email })
                .then(user => {
                    if (!user) {
                        req.session.errorMessage = 'Bu mail adresi ile ilişkili kullanıcı bulunamadı!'
                        req.session.save(function (err) {
                            console.log(err)
                            return res.redirect('/login')
                        })
                    }

                    bcrypt.compare(password, user.password)
                        .then(isSuccess => {
                            if (isSuccess) {
                                req.session.user = user
                                req.session.isAuthenticated = true

                                return req.session.save(function (err){
                                    var url = req.session.redirectTo || '/'
                                    delete req.session.redirectTo
                                    res.redirect(url)
                                })
                            }

                            req.session.errorMessage = 'Hatalı eposta veya parola girdiniz!'
                            req.session.save(function (err) {
                                console.log(err)
                                return res.redirect('/login')
                            })
                        })
                        .catch(err => console.log(err))
                })
                .catch(err => console.log(err))
        })
        .catch(err => {
            if (err.name == 'ValidationError'){
                let message = ''

                for(field in err.errors){
                    message += err.errors[field].message + '<br>'
                }

                res.render('account/login', {
                    path: '/login',
                    title: 'Login Page',
                    errorMessage: message
                })
            } else {
                next(err)
            }
        })
}

exports.getRegister = (req, res, next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage

    res.render('account/register', {
        path: '/register',
        title: 'Register Page',
        errorMessage: errorMessage
    })
}

exports.postRegister = (req, res, next) => {
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password

    User.findOne({ email: email })
        .then(user => {
            if (user) {
                req.session.errorMessage = 'Bu mail adresi ile daha önce kayıt olunmuş!'
                req.session.save(function (err) {
                    return res.redirect('/register')
                })
            }

            return bcrypt.hash(password, 10)
        })
        .then(hashPass => {
            const newUser = new User({
                name: name,
                email: email,
                password: hashPass,
                cart: { items: [] }
            })

            return newUser.save()
        })
        .then(() => {
            res.redirect('/login')

            let mailOptions = {
                from: '@gmail.com',
                to: email,
                subject: 'Hesap oluşturuldu.',
                text: 'Hesabınız başarılı bir şekilde oluşturuldu.'
            }
            msg.sendMail(mailOptions)
        })
        .catch(err => {
            if (err.name == 'ValidationError'){
                let message = ''

                for(field in err.errors){
                    message += err.errors[field].message + '<br>'
                }

                res.render('account/register', {
                    path: '/register',
                    title: 'Register Page',
                    errorMessage: message
                })
            } else {
                next(err)
            }
        })
}

exports.getReset = (req, res, next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage

    res.render('account/reset', {
        path: '/reset-password',
        title: 'Reset Password Page',
        errorMessage: errorMessage
    })
}

exports.postReset = (req, res, next) => {
    const email = req.body.email

    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            return res.redirect('/reset-password')
        }

        const token = buffer.toString('hex')

        User.findOne({ email: email })
            .then(user => {
                if (!user) {
                    req.session.errorMessage = 'mail adresi bulunamadı!'
                    req.session.save(function (err) {
                        console.log(err)
                        return res.redirect('/reset-password')
                    })
                }

                user.resetToken = token
                user.resetTokenExpiration = Date.now() + 3600000

                return user.save()
            })
            .then(result => {
                res.redirect('/')

                let mailOptions = {
                    from: '@gmail.com',
                    to: email,
                    subject: 'Parola sıfırlama.',
                    html: `
                        <p>Parolanızı güncellemek için aşağıdaki bağlantıya tıklayın</p>
                        <p><a href="http://localhost:3000/reset-password/${token}">Parolayı resetle</a></p>
                    `
                }
                msg.sendMail(mailOptions)
            })
            .catch(err => next(err))

    })
}

exports.getNewPassword = (req, res, next) => {
    var errorMessage = req.session.errorMessage
    delete req.session.errorMessage

    const token = req.params.token

    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        }
    }).then(user => {
        res.render('account/new-password', {
            path: '/new-password',
            title: 'New Password',
            errorMessage: errorMessage,
            userId: user._id.toString(),
            passwordToken: token
        })
    }).catch(err => next(err))
}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password
    const userId = req.body.userId
    const token = req.body.passwordToken

    let _user;

    User.findOne({
        resetToken: token,
        resetTokenExpiration: {
            $gt: Date.now()
        },
        _id: userId
    }).then(user => {
        _user = user
        return bcrypt.hash(newPassword, 10)
    }).then(hashedPassword => {
        _user.password = hashedPassword
        _user.resetToken = undefined
        _user.resetTokenExpiration = undefined

        return _user.save()
    }).then(()=>{
        res.redirect('/login')
    }).catch(err => next(err))
}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        res.redirect('/')
    })
}
