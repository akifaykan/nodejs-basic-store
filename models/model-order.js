// Order model
const mongoose = require('mongoose')

const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

const orderSchema = new mongoose.Schema({
    user: {
        userId: {
            type: mongoose.Types.ObjectId,
            required: true,
            ref: 'User'
        },
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        }
    },
    items: [
        {
            product: {
                type: Object,
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }
    ],
    date: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Order', orderSchema)
