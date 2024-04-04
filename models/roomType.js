const mongoose = require('mongoose');

// const Schema = mongoose.Schema;
const roomTypeSchema = new mongoose.Schema({
  roomType : String,
  roomName : String,
  roomId : String,
  personCount : Number,
  // hotel : {type: Schema.Types.ObjectId, ref:'hotel' }
});

const RoomType = mongoose.model('roomType', roomTypeSchema);
module.exports = RoomType;