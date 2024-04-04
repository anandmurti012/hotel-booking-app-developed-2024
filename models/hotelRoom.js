const mongoose = require('mongoose');

const hotelRoomSchema = new mongoose.Schema({
  hotelId:String,
  rooms: [
    {
      roomId:String,
      roomName:String,
      personCount:Number,
      price:String,
      roomNumbers:Number,
      image:[String],
      bookings:[
        {
          dateId:String,
          bookingId:String,
          userId:String,
          bookingStatus:String,
          personCount:Number
        }
      ]
    }
  ]
});
//rooms and image is an arraylist
//Note:- rooms is an array of object
//image is an array of string
//we can iterate arrayList by forEach loop 
//for loop inside for loop is used to iterarate arrayList inside arrayList.


const HotelRoom = mongoose.model('hotelRooms', hotelRoomSchema);
module.exports = HotelRoom;