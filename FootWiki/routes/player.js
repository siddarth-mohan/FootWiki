// const fs = require('fs');
// var express = require("express");
// var router  = express.Router();

// router.get("/",function(req,res){
// 	res.render("playerHome");
// });

// router.get("/display",function(req,res){
// 	res.render("display-players");
// });

// router.get("/add",function(req,res){
// 	res.render("add-players");
// });

// router.get("/update",function(req,res){
// 	res.render("edit-players");
// });

// router.get("/delete",function(req,res){
// 	res.render("delete-players");
// });

// getAllPlayers: (req, res) => {
//         let query = "SELECT * FROM `players` ORDER BY id ASC"; // query database to get all the players

//         // execute query
//         db.query(query, (err, result) => {
//             if (err) {
//                 res.redirect('/');
//             }
//             res.render('display-player.ejs', {players: result});
//         });
//     }

// addPlayer: (req, res) => {

//        // let message = '';
//         let first_name = req.body.first_name;
//         let last_name = req.body.last_name;
//         let position = req.body.position;
//         let number = req.body.number;
//         let username = req.body.username;
//         let uploadedFile = req.files.image;
//         let image_name = uploadedFile.name;
//         let fileExtension = uploadedFile.mimetype.split('/')[1];
//         image_name = username + '.' + fileExtension;

//         let usernameQuery = "SELECT * FROM `players` WHERE user_name = '" + username + "'";

//         db.query(usernameQuery, (err, result) => {
//             if (err) {
//                 return res.status(500).send(err);
//             }
//             if (result.length > 0) {
//                 message = 'Username already exists';
//                 res.render('add-player.ejs');
//             } else {
//                 // check the filetype before uploading it
//                 if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
//                     // upload the file to the /public/assets/img directory
//                     uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
//                         if (err) {
//                             return res.status(500).send(err);
//                         }
//                         // send the player's details to the database
//                         let query = "INSERT INTO `players` (first_name, last_name, position, number, image, user_name) VALUES ('" +
//                             first_name + "', '" + last_name + "', '" + position + "', '" + number + "', '" + image_name + "', '" + username + "')";
//                         db.query(query, (err, result) => {
//                             if (err) {
//                                 return res.status(500).send(err);
//                             }
//                             res.redirect('/');
//                         });
//                     });
//                 } else {
//                     message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
//                     res.render('add-player.ejs');
//                 }
//             }
//         });
//     }

// editPlayerPage: (req, res) => {
//         let playerId = req.params.id;
//         let query = "SELECT * FROM `players` WHERE id = '" + playerId + "' ";
//         db.query(query, (err, result) => {
//             if (err) {
//                 return res.status(500).send(err);
//             }
//             res.render('edit-player.ejs');
//         });
//     }

// editPlayer: (req, res) => {
//         let playerId = req.params.id;
//         let first_name = req.body.first_name;
//         let last_name = req.body.last_name;
//         let position = req.body.position;
//         let number = req.body.number;

//         let query = "UPDATE `players` SET `first_name` = '" + first_name + "', `last_name` = '" + last_name + "', `position` = '" + position + "', `number` = '" + number + "' WHERE `players`.`id` = '" + playerId + "'";
//         db.query(query, (err, result) => {
//             if (err) {
//                 return res.status(500).send(err);
//             }
//             res.redirect('/');
//         });
//     }

// deletePlayer: (req, res) => {
//         let playerId = req.params.id;
//         let getImageQuery = 'SELECT image from `players` WHERE id = "' + playerId + '"';
//         let deleteUserQuery = 'DELETE FROM players WHERE id = "' + playerId + '"';

//         db.query(getImageQuery, (err, result) => {
//             if (err) {
//                 return res.status(500).send(err);
//             }

//             let image = result[0].image;

//             fs.unlink(`public/assets/img/${image}`, (err) => {
//                 if (err) {
//                     return res.status(500).send(err);
//                 }
//                 db.query(deleteUserQuery, (err, result) => {
//                     if (err) {
//                         return res.status(500).send(err);
//                     }
//                     res.redirect('/');
//                 });
//             });
//         });
//     }

// module.exports = router;