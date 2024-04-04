const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
 name:String,
 address:{
  state:String,
  city:String,
  fullAddress:String
 },
 description:String,
 hotelId:String,
 image: [String],
 nameSearch:String
})

const modelHotel = mongoose.model('hotel', hotelSchema);
module.exports = modelHotel;
