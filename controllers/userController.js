const mongoose = require('mongoose');
const User = require('../models/userSchema');
const { joiUserSchema } = require('../models/validationSchema');
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const Product = require('../models/productSchema')
const orderSchema = require('../models/orderSchema');
const userSchema = require('../models/userSchema');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);




///Database connection
mongoose.connect("mongodb://0.0.0.0:27017/Database-new", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

let sValue = {};


module.exports = {


    createUser: async (req, res) => {
        const { value, error } = joiUserSchema.validate(req.body);
        const { name, email, username, password } = req.body;
        if (error) {
          res.json(error.message);
        }
        
        await User.create({
          name: name,
          email: email,
          username: username,
          password: password,
        });
        res.status(201).json({
          status: "success",
          message: "user registration successfull.",
        });

        //
    },

    //user Login (POST api /users/login)
    //

    userLongin: async (req, res) => {
      const { value, error } = joiUserSchema.validate(req.body);
     
      if (error) {
        return res.status(400).json({status:'error',message:error.message});
      }
      console.log(value);

      const { username, password } = value;
      const user = await User.findOne({ username: username });
      
      if (!user) {
        return res.status(404).json({ status: "error", message: "User not found" });
      }
      if (!password || !user.password) {
        return res.status(400).json({ status: "error", message: "Invalid input" });
      }
      
      const checkPass = await bcrypt.compare(password, user.password);
      if (!checkPass) {
         return  res.status(400).json({ status: "error", message: "password incorrect" });
      }
      const token = jwt.sign(
        { username: user.username },
        
        process.env.USER_ACCESS_TOKEN_SECRET,
        {
          expiresIn: 86400,
        }
        
      );
      res.status(200).json({ status: "success",
       message: "Login successful",
       data: token });
    },

    productList : async (req,res)=>{
      const product = await Product.find();
      if(product.length === 0){
        return res.status(400).json({message:"no product"})
      }
      res.status(201).json({
        status:"success",
        message : "successfully listed",
        product
      })
    },

    productGetById :  async (req,res)=>{
      const Id = req.params.id
      const productId = await Product.findById(Id)
      if(!productId){
        res.status(404).json({error : "error in fetching"})
      }
      res.status(201).json({
        status : "success",
        message : "product succesfully fetched",
        data : productId
      })
      
    },

    ProductByCategory: async (req, res) => {
      const Category = req.params.categoryname;
      const products = await Product.find({ category: Category });
      if (!products) {
        return res.status(404).json({ error: "Category not found" });
      }
      res.status(200).json({
        status: "success",
        message: "Successfully fetched category details.",
        data: products,
      });
    },

    addToCart: async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      await User.updateOne({_id:userId},{$push:{cart:productId}});
      console.log(productId);
      res.status(200).json({
        status:'success',
        message : "product succesfully added to cart"
      })
    },

    deleteFromCart : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      await User.updateOne({_id : userId},{$pull:{cart : productId}})
      res.status(201).json({
        status : "success",
        message :"product removed from the cart",
        
      })
    },
    
    showCart: async (req, res) => {
      const userId = req.params.id;
      const cart = await User.findOne({ _id: userId }).populate("cart");
      console.log(cart)
      if (!cart) {
        return res.status(404).json({ error: "Nothing to show on Cart" });
      }
      res.status(200).json({
        status: "success",
        message: "Successfully fetched cart details.",
        data:cart,
      });
    },

    wishList : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      console.log(productId);
      await User.updateOne(
        {_id : userId},
        {$addToSet:{wishList : productId}}
      )

      res.status(201).json({
        status :"success",
        message : "product added to wish list "
      })
    },

    showWishList : async (req,res)=>{
      const userId = req.params.id;
      const wishList = await User.find({_id:userId}).populate('wishList');
      

      if(!wishList){res.status(404).json({error : "nothing to show in wish list"})}
      res.status(201).json({
        status : "success",
        message : "products in wish list ",
        data : wishList
      })
    },

    deleteWishList : async (req,res)=>{
      const userId = req.params.id;
      const productId = req.body.productId;
      await User.updateOne({_id :userId},{$pull:{wishList:productId}})

      res.status(201).json({
        status : "success",
        message : "wish list data deleted"
      })
   },

   payment: async (req, res) => {
    const id = req.params.id;
    uid = id; //for passing as global variable
    const user = await User.findOne({ _id: id }).populate("cart"); //user with cart
    if (!user) {
      return res.status(404).json({ message: "user not found " });
    }
    const cartItems = user.cart;
    if (cartItems.length === 0) {
      return res.status(200).json({ message: "Your cart is empty" });
    }

    const lineItems = cartItems.map((item) => {
      return {
        price_data: {
          currency: "inr",
          product_data: {
            name: item.title,
            description: item.description,
          },
          unit_amount: Math.round(item.price * 100), // when item.price only given ,error occur, why ? check its reason . why multiply 100
        },
        quantity: 1,
      };
    });
    session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"], //, 'apple_pay', 'google_pay', 'alipay',card
      line_items: lineItems,
      mode: "payment",
      success_url: `http://localhost:3003/api/users/payment/success`, // Replace with your success URL
      cancel_url: "http://localhost:3003/api/users/payment/cancel", // Replace with your cancel URL
    });

    if (!session) {
      return res.json({
        status: "Failure",
        message: " Error occured on  Session side",
      });
    }
    sValue = {
      //values to be sent to success function
      id,
      user,
      session,
    };

    res.status(200).json({
      status: "Success",
      message: "Strip payment session created",
      url: session.url,
    });
    


    },

    success : async (req,res)=>{
      const {id,user,session} = sValue ;
      const cartItem = user.cart ; 


      const order = await orderSchema.create({
        userId : id ,
        products : cartItem.map(
          (value)=> new mongoose.Types.ObjectId(value._id)
  
          ) , //we get product in cart
          order_id: session.id,
          payment_id: `demo ${Date.now()}`,
          total_amount: session.amount_total / 100,
      })

      if(!order){
        res.status(403).json({message : "error include while inputing orderschema"})
      }
      const orderId = order._id;

      const updateUser = await User.updateOne(
        {_id : id},
        {
          $push:{orders :orderId },
           $set:{cart : []}
          }
        );

        res.status(201).json({
          status :"success",
          message : "paymentsuccesful"})
    },

    cancel: async (req, res) => {
      res.status(200).json({
        status: "Success",
        message: "Payment cancelled.",
      });
    },
     
    showOrders: async (req, res) => {
      
      const id = req.params.id;
      const user = await userSchema.findById(id).populate("orders");
      if (!user) {
        return res
          .status(404)
          .json({ status: "Failure", message: "User not found." });
      }
      const uOrder = user.orders; 
      
      if (!uOrder || uOrder.length === 0) {
        return res.status(200).json({ message: "you have no orders to show" });
      }
      const orderProductDetails = await orderSchema.find({ _id: { $in: uOrder } })
      .populate("products")
       
      
      res.status(200).json({
        status: "Success.",
        message: "Fetched Order Details",
        orderProductDetails,
      });
    },



    }

    

   
    

    
   

      



