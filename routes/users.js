const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');
const config = require('../config/database');
const User = require('../models/user');

//Register info into to server
router.post('/register',(req,res,next) =>{
    let newUser = new User({ //new user from model
        name: req.body.name,
        email: req.body.email,
        username: req.body.username,
        password: req.body.password
    });

    User.checkIfExisting(newUser.email,(err,user)=>{ // here i check if exist user with yhe same email.
        if(err) throw err;
        if(user){
            res.json({success:false,type:"email exist",msg:"Email exist in the system"});
        }
        else{
            User.addUser(newUser,(err,user)=>{ // if not exist user with same email ,carried out rigester
                if(err){
                    res.json({success: false,type:"addUser",msg: 'Failed to register'});
                }
                else{
                    res.json({success: true,msg: 'User register'});
                }
            });
        }
        });
    });


//Authenticate
router.post('/authenticate',(req,res,next)=>{
    const username = req.body.username;
    const password = req.body.password;

    User.getUserByUserName(username,(err,user)=>{
        if(err) throw err;
        if(!user){
            return res.json({success:false, msg:"User not found"});
        }
        User.comparePassword(password,user.password,(err,isMatch)=>{
            if(err) throw err;
            if(isMatch){
                const token = jwt.sign({payload:user},config.secret, {expiresIn:604800}); //what is jwt??
                res.json({
                    success: true,
                    token: 'JWT '+token,
                    user:{
                        id: user._id,
                        name: user.name,
                        username : user.username,
                        email: user.email
                    }
                });
            }else{
                return res.json({success: false, msg:'Wrong password'});
            }
        });
    });
});

//add new note
router.post('/addnote',(req,res,next)=>{
 
 const note = req.body;
 User.addNewNote(note,(err,note)=>{
     if(err){
         res.json({success:false,msg:'problem to add note'});
     }else{
         res.json({success:true,msg:'The note add successfully'});
     }
 });

});

router.get('/getnotes',(req,res,next)=>{
    const url = new URL("http:/"+req.url);
    const userId = url.searchParams.get("userId");
    User.getNotes(userId,(err,notes)=>{
        if(err){
            res.json({success: false ,msg:'problem to send the notes'});
        }else{
            res.json({success: true, notes:notes.notes, msg:'The notes send successfully'});
        }
    });
    
  //User.getNotes()
});

router.post('/removenote',(req,res,next)=>{
    const note = req.body;
    User.removeNote(note,(err)=>{     
        if(err){
            res.json({success: false ,msg:'problem to remove the note'});
        }else{
            res.json({success: true , msg:'The note is removed'});
        }
    })

});
//Profile
router.get('/profile',passport.authenticate('jwt',{session:false}),(req,res,next) =>{
    res.json({user:req.user});
    
});


module.exports = router;