const express = require('express')
const router = express.Router()
const adminController = require('../controllers/controller-admin')
const isAdmin = require('../middleware/middleware-isAdmin')
const locals = require('../middleware/middleware-locals')

/*
 * Products Routes
======================================*/
router.get('/products', locals, isAdmin, adminController.getProducts)

router.get('/add-product', locals, isAdmin, adminController.getAddProduct)
router.post('/add-product', locals, isAdmin, adminController.postAddProduct)

router.get('/product/:productid', locals, isAdmin, adminController.getEditProduct)
router.post('/product', locals, isAdmin, adminController.postEditProduct)

router.post('/delete-product', locals, isAdmin, adminController.postDeleteProduct)

/*
 * Categories Routes
======================================*/
router.get('/categories', locals, isAdmin, adminController.getCategories)

router.get('/add-category', locals, isAdmin, adminController.getAddCategory)
router.post('/add-category', locals, isAdmin, adminController.postAddCategory)

router.get('/category/:categoryid', locals, isAdmin, adminController.getEditCategory)
router.post('/category', locals, isAdmin, adminController.postEditCategory)

router.post('/delete-category', locals, isAdmin, adminController.postDeleteCategory)

module.exports = router