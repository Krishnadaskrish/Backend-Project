const mongoose = require('mongoose');
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name : String,
    email :String,
    username: String,
    password : String,
    cart : [{type : mongoose.Schema.ObjectId,ref : "products"}],
    wishList :[{type :mongoose.Schema.ObjectId,ref :'products'}],
    orders: [],
})

userSchema.pre('save',async function (next){
    const user = this;
    if(!user.isModified('password')) return next();
    

    const hashPassword = await bcrypt.hash(user.password,10);
    user.password = hashPassword;
    next()
}); 

module.exports = mongoose.model('user',userSchema)