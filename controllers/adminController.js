const mongoose = require('mongoose');
const User = require('../models/userSchema');
const jwt = require('jsonwebtoken');
const Product = require('../models/productSchema');
const { joiProductSchema } = require('../models/validationSchema');
const orderSchema = require('../models/orderSchema');

///Database connection
mongoose.connect("mongodb://0.0.0.0:27017/Database-new", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

module.exports = {
    //Admin Login (POST api/admin/login)

    login: async(req,res) =>{
        const { username, password} = req.body;
        if(
            username === process.env.ADMIN_USERNAME &&
            password === process.env.ADMIN_PASSWORD
        ){
            const token = jwt.sign(
                {username : username},
                process.env.ADMIN_ACCESS_TOKEN_SECRET
            );
            res.status(200).json({
                status: "success",
                message: "Successfully logged In.",
                data: { jwt_token: token },
              });
            
        }else {
            return res.status(404).json({
                status : "error",
                message:"Not an Admin"
            })
        }
    },
    
    //get all users list (GET api/)

    getAllUsres: async (req,res)=>{
        const allUsers = await User.find();
        res.status(200).json({
            status: "success",
            message:"successfully fetched user data",
            data:allUsers
        })
    },

    //get users by ID

    getUserByid: async (req, res) => {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
          status: "success",
          message: "Successfully fetched user data.",
          data: user,
        });
      },

      createProduct : async (req,res)=>{
        const {value,error} = joiProductSchema.validate(req.body);
        const {title,description,price,image,category} = req.body ;
        if(error){
            res.json(error.message)
        }
         await Product.create ({
            title ,
            description,
            price,
            image,
            category,
         });

         res.status(201).json({
            status : "success",
            message : "product successfully created"
         })

      },

      getAllProduct : async(req, res)=>{
        const getAllProduct = await  Product.find();
        res.status(201).json({
          status : "success",
          message: "succesfully fetch product",
          data : getAllProduct
        })
      },

      getProductsByCatogory: async (req, res) => {
        const categ = req.query.name;
      
        const products = await Product.find({ category: categ });
        if (!products) {
          return res.status(404).json({ error: "Category not found" });
        }
        res.status(200).json({
          status: "success",
          message: "Successfully fetched product details.",
          data: products,
        });
      },

      getProductById: async (req, res) => {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({ error: "User not found" });
        }
        res.status(200).json({
          status: "success",
          message: "Successfully fetched product details.",
          data: product,
        });
      },

      updateProduct: async (req, res) => {
        const { title, description, image, price, category, id } = req.body;
        const product = await Product.findById(id);
        if (!product) {
          return res.status(404).json({ error: "Product not found" });
        }
        await Product.updateOne(
          { _id: id },
          {
            $set: {
              title: title,
              description: description,
              price: price,
              image: image,
              category: category,
            },
          }
        );
        res.status(201).json({
          status: "success",
          message: "Successfully updated the product.",
        });
      },
      deleteProduct : async (req,res)=>{

        const {id} = req.body;
        await Product.findByIdAndDelete(id);
        res.status(201).json({
          status:"success",
          message : "product succesfully deleted"
        })        
      },


      orderDetails : async (req,res)=>{
        const order = await orderSchema.find();
        console.log(order);
        if(order.length === 0){
          res.status(404).json({message :'no orders yet' })
        }

        res.status(201).json({status : "success",message : "oreder successfully fetched",data : order})
      },

      stats : async (req,res) => {
        const order = await orderSchema.find();

        const data = await orderSchema.aggregate([
          {
            $group:{
              _id : null ,
              totalProductPurchaced :{$sum:{$size:"$products"}},
              revenu: {$sum:"$total_amount"},
            },
          },
          {$project:{_id : 0}}
        ])

        res.json({data})


      }


      }



    
    


     

