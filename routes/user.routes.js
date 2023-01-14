const express = require('express');
const router = express.Router();
let collectionName = "user";
let userInfoCollection = "userInfo";

const util = require("../common/util");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require('moment')


router.post('/register', async (req, resp, next) => {
  try {
    // Get user input
    const { userName, name, email, password, nick_name, mobile, address, country, state, city, pinCode, profile_image} = req.body;
    console.log(mobile,address,country,state,city,pinCode,profile_image, nick_name)

    // Validate user input
    if (!( password && userName && name && email)) {
      return resp.status(400).send({ statusCode: 400, success: false, msg: "Input parameters invalid.", data: {} });
    }

    let queryToSearch = {
      userName
    };
    // Validate if user exist in our database
    const oldUser = await util.mongo.find(collectionName, queryToSearch);

    if (oldUser.length > 0) {
      return resp.status(400).send({ statusCode: 400, success: false, msg: "User with this username already exists. Kindly LogIn", data: {} });
    }

    //Encrypt user password
    encryptedPassword = await bcrypt.hash(password, 10);

    // Create token
  
    // Create user in our database
    let user = await util.mongo.insertOne(collectionName, {
      userName,
      name,
      email,
      password: encryptedPassword,
      created_at : moment(new Date()).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss'),
      updated_at : moment(new Date()).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss'),
      status : 1
    });
    console.log("user", user);
    if(user && user.insertedCount === 1) {
      let userId = user.insertedId;
      console.log("userId", userId);
      let userInfo = await util.mongo.insertOne(userInfoCollection, {
        userId : userId,
        nick_name,
        mobile,
        address,
        country,
        state,
        city,
        pinCode,
        profile_image,
        created_at : moment(new Date()).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss'),
        updated_at : moment(new Date()).utcOffset("+05:30").format('YYYY-MM-DD HH:mm:ss'),
        status : 1
      });
      console.log("userInfo", userInfo);
      if(userInfo && userInfo.insertedCount === 1){

        return resp.status(200).send({ statusCode: 200, success: true, msg: "User add Success", data: user });
      } else {
        return resp.status(400).send({ statusCode: 400, success: false, msg: "userInfo add failed in Mongo", data: {} }); 
      }
    } else {
      return resp.status(400).send({ statusCode: 400, success: false, msg: "User add failed in Mongo", data: {} }); 
    }
  } catch (err) {
    console.log(err);
    return resp.status(500).send({ statusCode: 500, success: false, msg: "User register Failed", data: {} });
  }
});

router.post("/login", async (req, resp) => {
  try {
    const { userName, password } = req.body;

    if (!(userName && password)) {
      return resp.status(400).send({ statusCode: 400, success: false, msg: "All Inputs are required to LogIn", data: {} });
    }

    let queryToSearch = {
      userName
    };
    let user = await util.mongo.find(collectionName, queryToSearch);
    console.log(user);
    if(user.length > 0) {
      if(user[0].status){

        if (user && (await bcrypt.compare(password, user[0].password))) {
          const token = jwt.sign(
            { user_id: user[0]._id, userName },
            process.env.tokenKey,
            {
              expiresIn: "2h",
            }
          );  
          return resp.status(200).send({ statusCode: 200, success: true, msg: "LogIn Success.", token: token  });
        } else {
          return resp.status(400).send({ statusCode: 400, success: false, msg: "InValid Credentials.", data: {} });
        }
      } else {
        return resp.status(400).send({ statusCode: 400, success: false, msg: "please contact admin as you are inactive", data: {} });
      }
    } else {
      return resp.status(400).send({ statusCode: 400, success: false, msg: "No User found with this credentials.", data: {} });
    }
  } catch (err) {
    console.log("error: ",err);
    return resp.status(500).send({ statusCode: 500, success: false, msg: "User Login Failed.", data: {} });
  }
});


module.exports = router;
