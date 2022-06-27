// User Models
const mongoose = require('mongoose')
const Product = require('./model-products')
const { isEmail } = require('validator')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        validate: [isEmail, 'invalid email']
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    isAdmin: {
      type: Boolean,
      default: false
    },
    cart: {
        items: [
            {
                productId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Product',
                    required: true
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
})

userSchema.methods.addToCart = function (product){
    const index = this.cart.items.findIndex(cp => {
        return cp.productId.toString() === product._id.toString()
    })

    const updateCartItems = [...this.cart.items]

    let itemQuantity = 1
    if (index >= 0) {
        // Sepette zaten eklenmek istenen ürün var, miktarını arttır.
        itemQuantity = this.cart.items[index].quantity + 1
        updateCartItems[index].quantity = itemQuantity
    } else {
        // updateCartItems'a yeni bir ürün ekle.
        updateCartItems.push({
            productId: product._id,
            quantity: itemQuantity
        })
    }

    this.cart = {
        items: updateCartItems
    }
    
    return this.save()
}

userSchema.methods.getCart = function (){
    const ids = this.cart.items.map(i => {
        return i.productId
    })
    
    return Product
        .find({
            _id: { $in: ids }
        })
        .select('name price imgurl')
        .then(products => {
            return products.map(p => {
                return {
                    name: p.name,
                    price: p.price,
                    imgurl: p.imgurl,
                    quantity: this.cart.items.find(i => {
                        return i.productId.toString() == p._id.toString()
                    }).quantity
                }
            })
        })
}

userSchema.methods.deleteCartItem = function (productid){
    const cartItems = this.cart.items.filter(item =>{
        return item.productId.toString() !== productid.toString()
    })
    
    this.cart.items = cartItems
    return this.save()
}

userSchema.methods.clearCart = function (){
    this.cart = { items: [] }
    return this.save()
}

module.exports = mongoose.model('User', userSchema)