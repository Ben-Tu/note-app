const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/database');
const ObjectId = require('mongodb').ObjectID;

//User Schema
const UserSchema = mongoose.Schema({
    name: {
        type:String
    },
    email: {
        type:String,
        required: true
    },
    username: {
        type:String,
        required: true
    },
    password: {
        type:String,
        required: true
    },
    notes:[{
        title: String,
        body: String,
        date : String
    }]  
});

//export User module that is a mongose schema
const User =module.exports = mongoose.model('User',UserSchema);


module.exports.getUserById = function(id,callback){
    User.findById(id,callback);
}

module.exports.getUserByUserName = function(username,callback){
    const query = {username: username}
    User.findOne(query,callback);
}

module.exports.checkIfExisting = function(email,callback){
    const query = {email:email}
    User.findOne(query,callback);
}

module.exports.addUser = function(newUser,callback){
    bcrypt.genSalt(10,(err,salt)=>{ //create random pass 
        bcrypt.hash(newUser.password,salt,(err,hash)=>{
            if(err) throw err;
            newUser.password = hash;
            newUser.save(callback);
        });
    });
}
module.exports.addNewNote = function(note,callback){
    User.updateOne(
        {_id: note.user},
        { $push:{notes: note.note}},(callback))
}

module.exports.getNotes = function(userId,callback){
    User.findOne({_id:userId},{notes:1},callback);
}

module.exports.removeNote =function(noteRemove,callback){
    User.updateOne(
        {_id: noteRemove.idUser},
        { $pull : {"notes" : { _id: noteRemove.idNote } } },callback);
        
}
module.exports.comparePassword = function (candidatePassword,hash,callback){
    bcrypt.compare(candidatePassword,hash,(err,isMatch)=>{
        if(err) throw err;
        callback(null,isMatch);
    });
}

