require('dotenv').config();
const express = require("express");
const app = express();
const port = 3003;

const userRoute = require("./routers/userRouter");
const adminRoute = require('./routers/adminRouter')
const ErrorHandler = require("./middilewares/ErrorHandler");

app.use(express.json());

app.use("/api/users", userRoute);
app.use("/api/admin",adminRoute)
app.use(ErrorHandler);

app.listen(port, (err) => {
  if (err) {
    console.log(err);
  }
  console.log("Server Running at port: " + port);
});


