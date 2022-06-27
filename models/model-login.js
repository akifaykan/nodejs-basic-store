// User Models
const mongoose = require('mongoose')
const { isEmail } = require('validator')

const loginSchema = new mongoose.Schema({
    email: {
        type: String,
        validate: [isEmail, 'Hatalı eposta hesabı']
    },
    password: {
        type: String,
        required: [true, 'Parola girmelisiniz']
    }
})

module.exports = mongoose.model('Login', loginSchema)