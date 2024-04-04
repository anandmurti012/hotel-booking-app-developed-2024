const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const session = require('express-session');
const Hotel = require("../models/hotelCollection");
const RoomType = require("../models/roomType");
const HotelRoom = require("../models/hotelRoom");
const Users = require("../models/users");
const Admin = require('../models/admin');
const Bookings = require('../models/bookings');
const bodyParser = require("body-parser");
router.use(bodyParser.json());

router.use(session({
  secret: 'anand',
  resave: false,
  saveUninitialized: false
}));

router.get("/", (req, res) => {
  res.render("landingPage", { page: "Landing page" });
});

router.get('/about', (req, res) => {
  res.render('hotels/about', { page: "About Us" });
})
router.get('/contact', (req, res) => {
  res.render('hotels/contact', { page: "Contact Us" });
})
router.get("/hotelIndex", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.render("hotels/HotelIndexPage", { hotels, page: "Index-page" });
  } catch (error) {
    console.log(error);
  }
});
 
router.get("/addProperty", (req, res) => {
  res.render("hotels/addProperty", { page: "Add Property" });
});

//======Random function generator function==========
function generateSixDigitNumber() {
  return Math.floor(Math.random() * 900000) + 100000;
}

router.post("/addHotels", async (req, res) => {
  try {
    const randomNumber = generateSixDigitNumber();
    console.log("Generated hotelId:", "hotel" + randomNumber);

    req.body.hotel.hotelId = "hotel" + randomNumber;
    req.body.hotel.nameSearch = req.body.hotel.name.toLowerCase();

    const addHotels = new Hotel(req.body.hotel);
    await addHotels.save();

    res.redirect('/hotelAdminIndex');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

const mSaveHotelRoom = async (f_RoomId, f_Price, f_RoomNumbers, f_Image) => {      //'f_' indicates data is comming from frontend
  try {
    const mRoomData = await RoomType.findOne({ roomId: f_RoomId });
    console.log("mRoom Data -->" + mRoomData);
    const mHotelId = currentHotel.hotelId;
    const mHotelRoomData = await HotelRoom.findOne({ hotelId: mHotelId });

    if (mHotelRoomData != null) {
      const existingRoomIndex = mHotelRoomData.rooms.findIndex(
        (room) => room.roomId === f_RoomId
      );
      if (existingRoomIndex !== -1) {
        mHotelRoomData.rooms[existingRoomIndex] = {
          roomId: mRoomData.roomId,
          roomName: mRoomData.roomName,
          personCount: mRoomData.personCount,
          price: f_Price, //Price is comming from frontend by admin
          roomNumbers: f_RoomNumbers, //roomNumbers is comming from frontend by admin
          image: f_Image,
        };
      } else {
        mHotelRoomData.rooms.push({
          roomId: mRoomData.roomId,
          roomName: mRoomData.roomName,
          personCount: mRoomData.personCount,
          price: f_Price,
          roomNumbers: f_RoomNumbers,
          image: f_Image,
        });
      }
      await mHotelRoomData.save();
    } else {
      const mHotelRoom = new HotelRoom({
        hotelId: mHotelId,
        rooms: [
          {
            roomId: mRoomData.roomId,
            roomName: mRoomData.roomName,
            personCount: mRoomData.personCount,
            price: f_Price,
            roomNumbers: f_RoomNumbers,
            image: f_Image,
          },
        ],
      });
      await mHotelRoom.save();
      console.log("Hotel rooms saved successfully");
    }
  } catch (error) {
    console.error("Error saving Hotel room:", error);
  }
};

// var currentHotel;
// router.get("/hotels/admin/:hotelId", async (req, res) => {
//   try {
//     const hotelData = await Hotel.findOne({ hotelId: req.params.hotelId });
//     currentHotel = hotelData;

//     const roomDataFromBackend = await RoomType.find();
//     const mHotelRooms = await HotelRoom.findOne({
//       hotelId: req.params.hotelId,
//     });
//     const mBookings = await Bookings.find({userId:globalUserId.userId});
//     console.log("mbookings ->"+ mBookings);
//     // console.log("mHotelRooms -->" + mHotelRooms);
//     res.render("hotels/adminViewHotel", {
//       hotelData,
//       mBookings,
//       roomDataFromBackend,
//       mHotelRooms,
//       page: hotelData.name,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
//===================view index All====================
// var currentHotel;
// router.get("/hotelViewIndex", async (req, res) => {
//   try {
//     const hotelData = await Hotel.findOne({ hotelId: req.params.hotelId });
//     currentHotel = hotelData;

//     const roomDataFromBackend = await RoomType.find();
//     const mHotelRooms = await HotelRoom.findOne({
//       hotelId: req.params.hotelId,
//     });
//     console.log("mHotelRooms -->" + mHotelRooms);
//     res.render("hotels/hotelViewIndexPage", {
//       hotelData,
//       roomDataFromBackend,
//       mHotelRooms,
//       page: hotelData.name,
//     });
//   } catch (error) {
//     console.log(error);
//   }
// });
//==========***********=================

router.post("/saveRoom", (req, res) => {
  const { roomId, price, roomNumbers, image } = req.body; //This data is comming from frontend and we are extracting here
  console.log("request body -->", req.body);
  if (!currentHotel) {
    return res.status(400).json({ error: "Current hotel is not set" });
  }
  mSaveHotelRoom(roomId, price, roomNumbers, image);
  res.json({
    message: "Room saved successfully",
    roomId,
    price,
    roomNumbers,
    image,
  });
});
//==============Rooms details (API of add rooms )================
router.get("/addRooms", (req, res) => {
  res.render("hotels/rooms", { page: "Add Rooms" });
});

router.post('/saveRoomType', async (req, res) => {
  try {
    const addRooms = new RoomType(req.body.room);
    const savedRooms = await addRooms.save();
    console.log("Saved Rooms:", savedRooms);
    console.log('Rooms saved');
    res.redirect('/hotelAdminIndex');
    // res.send('Room saved');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

//===========Users=====================

router.get("/login", (req, res) => {
  res.render("hotels/userLogin", { page: "Login-page" });
});
//  router.post('/login', async(req, res)=> {
//   const saveUsers = new Users({
//     userName:"Anand Murti",
//     userId:"anand123",
//     password:"12345",
//     profilePic:"https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHByb2ZpbGUlMjBwaWN8ZW58MHx8MHx8fDA%3D"
//   });
//   await saveUsers.save();
//   res.send('User_Info_Saved');
// });

//================admin Login==================

router.get('/adminLogin', (req, res) => {
  res.render('hotels/adminLogin', { page: "Admin Login Page" })
});
// router.post('/adminLogin', async (req, res)=> {
// const saveAdmin = new Admin({
//   adminName:'Anand Murti',
//   adminId:'aMurtiAdmin',
//   password:'Admin123'
// })
// await saveAdmin.save();
// res.send('admin_Info_Saved');
// });

router.get("/hotelAdminIndex", async (req, res) => {
  //check if admin is logged in
  //if logged in open hotelAdminIndex
  // if not logged in open adminLoginPage

  if (req.session.admin) {
    
    try {
      const adminHotels = await Hotel.find();
      const mUsers = await Users.find();
      const mBooking = await Bookings.find();
      const mRoom = await RoomType.find();
      const mAdmin = await Admin.find();
      res.render("hotels/adminIndex", { adminHotels,mBooking,mRoom,mUsers,mAdmin, page: "Admin-Index-page" });
    } catch (error) {
      console.log(error);
    }

  } else {
    res.redirect('/adminLogin');
   
  }

 
});

var globalUserId;
router.post("/login", async (req, res) => {
  const { userId, password } = req.body;
  try {
    const user = await Users.findOne({ userId, password });
    if (user === null) {
      return res.status(401).send("Invalid userId or password");
    }
    globalUserId = user.userId;
    console.log("User found:", user);
    req.session.user = { userName: user.userName, userId: user.userId,profilePic:user.profilePic, login: "true" };
    res.redirect("/hotelIndex");  
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal Server Error");
  }
});

router.get('/check-login-status', (req, res) => {
  if (req.session.user) {
    
    res.json({ loggedIn: true, userName: req.session.user.userName, userId:req.session.user.userId,profilePic:req.session.user.profilePic });
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

router.get('/user-info', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

var currentHotel;
router.get("/hotels/:hotelId", async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ hotelId: req.params.hotelId });
    currentHotel = hotelData;
    const mHotelRooms = await HotelRoom.findOne({
      hotelId: currentHotel.hotelId,
    });
    console.log("mHotelRooms -->" + mHotelRooms);
    res.render("hotels/userViewHotel", { hotelData, mHotelRooms, page: hotelData.name });
  } catch (error) {
    console.log(error);
  }
});

//user profile view route
var globalRoomIds; // Define global variable
router.get('/userViewPage', async (req, res) => {
  const userInfo = await Users.find({ userId: globalUserId });
  const uBookings = await Bookings.find({ userId: globalUserId });
  globalRoomIds = uBookings.map(booking => booking.roomId); // Assign value to global variable
  const uRoomTypes = await RoomType.find({ roomId: { $in: globalRoomIds } });  
  //Note:-In MongoDB, the $in operator selects the documents where the value of a field equals any value in the 
  //specified array. It is commonly used to query documents based on multiple possible values for a field.
  console.log("globalRoomIds->", globalRoomIds);
  console.log("uRoomTypes-> ", uRoomTypes);
  res.render('hotels/userViewPage', { userInfo, uBookings,globalUserId, uRoomTypes, page: 'Users-page' });
});

//Admin
var globalAdminId;
router.post('/adminLogin', async (req, res) => {
  const { adminId, password } = req.body;
  try {
    const adminInfo = await Admin.findOne({ adminId, password });
    console.log("adminInfo-> "+ adminInfo);
    if (adminInfo === null) {
      return res.status(401).send("Invalid adminId or password");
    }
    globalAdminId = adminInfo.adminId;
    console.log("Admin found: ", adminInfo);
    req.session.admin = { adminName: adminInfo.adminName, adminId: adminInfo.adminId, login: "true" };
    res.redirect('/hotelAdminIndex');
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send("Internal server error");
  }
});

router.get('/check-login-status-admin', (req, res) => {
  if (req.session.admin) {
    
    res.json({ loggedIn: true, adminName: req.session.admin.adminName, adminId:req.session.admin.adminId});
  } else {
    res.json({ loggedIn: false });
  }
});

router.get('/logoutAdmin', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).send('Error logging out');
    }
    res.redirect('/');
  });
});

router.get('/admin-info', (req, res) => {
  if (req.session.admin) {
    res.json(req.session.admin);
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});

var currentHotel;
router.get("/hotels/admin/:hotelId", async (req, res) => {
  try {
    const hotelData = await Hotel.findOne({ hotelId: req.params.hotelId });
    currentHotel = hotelData;

    const roomDataFromBackend = await RoomType.find();
    const mHotelRooms = await HotelRoom.findOne({
      hotelId: req.params.hotelId,
    });
    const mBookings = await Bookings.find({hotelId: req.params.hotelId});
    const mUsers = await Users.find();
    console.log("user collection ->"+ mUsers);
    // console.log("mHotelRooms -->" + mHotelRooms);
    res.render("hotels/adminViewHotel", {
      hotelData,
      mUsers,
      mBookings,
      roomDataFromBackend,
      mHotelRooms,
      page: hotelData.name,
    });
  } catch (error) {
    console.log(error);
  }
});

router.get('/adminViewPage', async(req, res)=> {
 
  res.render('hotels/adminViewPage', {page: 'Admin Panel'});
});

let mStartDate, mEndDate;
const saveBookingInfo = async (f_RoomId, pStartDate, pEndDate, pNumDays, pTotalPrice, pHotelId, f_PersonCount) => {
  console.log("roomId->" + f_RoomId, ", ", "start date->" + pStartDate, ",", "end date->" + pEndDate, 
  ",", "No. of days->" + pNumDays, ",", "Total price->" + pTotalPrice, ",", "HotelId->" + pHotelId, ",",
   "userId->" + globalUserId, ",", "personCount->"+f_PersonCount);

  function getDateRange(startDateStr, endDateStr) {
    const [startDay, startMonth, startYear] = startDateStr.split('-').map(Number);
    const [endDay, endMonth, endYear] = endDateStr.split('-').map(Number);

    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
    mStartDate = startDate;
    mEndDate = endDate;
    const dateRange = [];

    // Loop from start date to one day before the end date
    for (let date = startDate; date < endDate; date.setDate(date.getDate() + 1)) {
      // Push the current date to the dateRange array
      const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getFullYear()}`;
      dateRange.push(formattedDate);
    }
    return dateRange;
  }
  
  const generateSixDigitNumber = function() {
    return Math.floor(Math.random() * 900000) + 100000;
  }
  const dateRange = getDateRange(sStartDate, sEndDate);
  const sHotelRoom = await HotelRoom.findOne({ hotelId: pHotelId });
  for (let room of sHotelRoom.rooms) {
    if (room.roomId === f_RoomId) {
      const bookingId = generateSixDigitNumber();
      const myBooking = new Bookings({
        bookingDate:new Date(),
        bookingId: bookingId,
        userId: globalUserId,
        checkInDate: mStartDate,
        checkOutDate: mEndDate,
        amount: sTotalPrice,
        hotelId: sHotelId,
        roomId: sRoomId,
        personCount: sPersonCount,
        bookingStatus: "booked"
      });
      await myBooking.save();

      dateRange.forEach(date => {
        // Push the booking object into the bookings array of the current room
        room.bookings.push({
          dateId: date,
          bookingId: bookingId,
          userId: globalUserId,
          bookingStatus: "booked",
          personCount: f_PersonCount
        });
      });
      break;
    }
  }
  // Save the updated sHotelRoom document
  await sHotelRoom.save();
};

let sRoomId, sStartDate, sEndDate, sNumDays, sTotalPrice, sHotelId, sPersonCount;

router.post("/saveUserInfo", (req, res) => {
  const { roomId, startDate, endDate, numDays, totalPrice, hotelId, personCount } = req.body;
  sRoomId = roomId;
  sStartDate = startDate;
  sEndDate = endDate;
  sNumDays = numDays;
  sTotalPrice = totalPrice;
  sHotelId = hotelId;
  sPersonCount = personCount;


  console.log("request body saveBookingInfo -->", req.body);

  saveBookingInfo(roomId, startDate, endDate, numDays, totalPrice, hotelId, personCount);
});

module.exports = router;


