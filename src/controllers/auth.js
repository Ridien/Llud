
const db = require('../models')
const User = db.users
const jwt = require("jsonwebtoken");

exports.postLogin = async (req, res, next) => {
    const user = req.body;
    if (!user.username || !user.password) {
      return res.status(400).send("Username and password are required.");
    }
    const userQuery = await User.findAll({
        where:{
            nickname:user.username
        }
    })
    console.log(userQuery)
    if(!userQuery.length){
        return res.status(401).send("Unauthorized!");
    }
    const userModel = userQuery[0]
    const isValidPassword = userModel.validatePassword(user.password)
    if(!isValidPassword){
        return res.status(401).send("Unauthorized!");
    }
    let token = null
    let isAdmin = userModel.isAdmin
    if(userModel.isAdmin){
        token = jwt.sign({ user:{username:user.username, userId:userModel.id, permissions: ['admin']} }, process.env.JWT_SECRET, {
            expiresIn: "24h",
        });
        return res.status(200).json({token:token, isAdmin:isAdmin})
    }
    token = jwt.sign({user:{username:user.username, userId:userModel.id, permissions: []}}, process.env.JWT_SECRET, {
        expiresIn: "24h",
    });
    
    return res.status(200).json({token:token, isAdmin:isAdmin})
};

exports.verifyUserToken = (req, res, next) => {
    if (!req.headers.authorization) {
      return res.status(401).send("Unauthorized request");
    }
    const token = req.headers["authorization"].split(" ")[1];
    if (!token) {
      return res.status(401).send("Access denied. No token provided.");
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded.user;
      next();
    } catch (err) {
      res.status(400).send("Invalid token.");
    }
  };