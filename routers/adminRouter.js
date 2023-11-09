const express = require('express');
const AdminRouter = express.Router();
const TryCatch = require('../middilewares/tryCatchMiddleware')
const AdminController = require('../controllers/adminController');
const verifyToken = require('../middilewares/adminAuthMiddleware')
const upload = require('../middilewares/imageUplode')







AdminRouter.post('/AdminLogin',TryCatch(AdminController.login))
AdminRouter.get('/users',TryCatch(AdminController.getAllUsres))
AdminRouter.get('/users/:id',TryCatch(AdminController.getUserByid))
AdminRouter.post('/products',verifyToken,upload,TryCatch(AdminController.createProduct))
AdminRouter.get('/products',verifyToken,TryCatch(AdminController.getAllProduct))
AdminRouter.get('/products/category',verifyToken,TryCatch(AdminController.getProductsByCatogory))
AdminRouter.get('/products/:id',verifyToken,TryCatch(AdminController.getProductById))
AdminRouter.put('/products',verifyToken,TryCatch(AdminController.updateProduct))
AdminRouter.delete('/products',verifyToken,TryCatch(AdminController.deleteProduct))
AdminRouter.get('/order',verifyToken,TryCatch(AdminController.orderDetails))
AdminRouter.get('/stats',verifyToken,TryCatch(AdminController.stats))





module.exports = AdminRouter 