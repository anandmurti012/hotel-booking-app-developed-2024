const express1 = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const app = express1();

mongoose.connect(process.env.MONGODB_URI)
.then(()=>{
console.log('Db connected Successfully');
})
.catch((error)=>{
console.log(error);
});

app.set('view engine', 'ejs');
app.use(express1.urlencoded({extended:true}));

const hotelRoutes = require('./routes/hotelRoutes');
app.use(hotelRoutes);

app.listen(process.env.PORT, ()=>{
  console.log(`Server is running at PORT ${process.env.PORT}`)
});

