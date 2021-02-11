//This is the main backend javascript file

//declaring constants to use modules
const express = require('express');
const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const path = require('path');
const app = express();
const fs = require('fs');
const bcrypt = require('bcrypt');
const session = require('express-session');

app.set('view engine', 'ejs'); // configure template engine
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client
app.use(express.static(path.join(__dirname, 'public'))); // configure express to use public folder
app.use(fileUpload());
app.use(session({ secret: 'notagoodsecret' }))


//connection to mysql databse
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'dbms',
	insecureAuth : true
});

db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;


//functions
//club functions
function displayAllClub(req, res) {
	message="";
        let query = "SELECT * FROM `clubs` ORDER BY club_id ASC"; // query database to get all the players
        db.query(query, (err, result, feilds) => {
            if (err) {
				res.redirect("/index");
				console.log(err);
            }
            res.render('club/display-clubs', {clubs: result});
        });
    }

function displayClubCount(req, res) {
        let query = "SELECT * FROM `club_count` ORDER BY club_id ASC"; // query database to get all the players
        db.query(query, (err, result, feilds) => {
            if (err) {
                res.redirect('/club');
				console.log(err);
            }
            res.render('club/club-count', {clubs: result});
        });
    }

function addClub(req, res){
       	let user_id = req.session.user_id;
        let message = '';
		let club_id = req.body.club_id;
        let name = req.body.name;
        let country = req.body.country;
		let home_stadium = req.body.home_stadium;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = club_id + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM `clubs` WHERE club_id = '" + club_id + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
				message= "Club with given ID already exists. enter unique club ID"
                res.render("error_page",{message:message});
                
            } 
			else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `clubs` (club_id, club_name, home_stadium, country, image,user_id) VALUES ('" + club_id + "', '" + name + "', '" + home_stadium + "', '" + country + "', '" + image_name + "', '"+ user_id +"')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/club/display');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                    res.render('error_page',{message, message});
                }
            }
        });
    }

function deleteClub(req, res){
		let curr_user_id = req.session.user_id;
        let club_id = req.params.id;
		let ini_qeury = 'SELECT * from `clubs` WHERE club_id = "' + club_id + '"';
        let getImageQuery = 'SELECT image from `clubs` WHERE club_id = "' + club_id + '"';
        let deleteManagerQuery = 'DELETE FROM `clubs` WHERE club_id = "' + club_id + '"';

        db.query(ini_qeury, (err,result12)=>{
		if (err) {
                return res.status(500).send(err);
            }
		else{
			
			let post_user= result12[0].user_id;
			console.log(post_user);
			if(curr_user_id == post_user){
	
				db.query(getImageQuery, (err, result) => {
					if (err) {
						return res.status(500).send(err);
					}

					let image = result[0].image;

					fs.unlink(`public/assets/img/${image}`, (err) => {
						if (err) {
							return res.status(500).send(err);
						}
					db.query(deleteManagerQuery, (err, result) => {
							if (err) {
								return res.status(500).send(err);
							}
							res.redirect('/club/display');
							console.log("successfully deleted")
					});
					});
				});
			}
			else{
				let message= "You cannot delete this club because this entry was not made by you!!"
				res.render("error_page",{message:message});
			}
		}
		});
    }


//manager functions
function displayAllManager(req, res) {
        let query = "SELECT * FROM `managers` ORDER BY manager_id ASC"; // query database to get all the players
        db.query(query, (err, result, feilds) => {
            if (err) {
                res.redirect('/');
				console.log(err);
            }
            res.render('manager/display-managers', {managers: result});
        });
    }

function addManager(req, res){
     	let user_id = req.session.user_id;
        let message = '';
		let manager_id = req.body.manager_id;
        let name = req.body.name;
        let age = req.body.age;
        let country = req.body.country;
        let club_id = req.body.club_id;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = manager_id + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM `managers` WHERE manager_id = '" + manager_id + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
				message= "Manager with given ID already exists. enter unique manager ID"
                res.render("error_page",{message:message});
                console.log('manager already exists');
            } 
			else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `managers` (manager_id, manager_name, age, country, club_id, image,user_id) VALUES ('" + manager_id + "', '" + name + "', '" + age + "', '" + country + "', '" + club_id + "', '" + image_name + "', '" + user_id +"')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/manager/display');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                	res.render("error_page",{message:message});
                }
            }
        });
    }

function editManagerPage(req, res){
		let curr_user_id = req.session.user_id;
        let manager_id = req.params.id;
        let query = "SELECT * FROM `managers` WHERE manager_id = '" + manager_id + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
			let post_user= result[0].user_id;
			console.log(post_user);
			if(curr_user_id == post_user){
            res.render('manager/edit-managers', {manager: result});
			}
			else{
				let message= "You cannot edit this manager because this entry was not made by you!!"
				res.render("error_page",{message:message});
			}
        });
    }

function editManager(req, res){
        let manager_id = req.params.id;
        let name = req.body.manager_name;
        let age = req.body.age;
        let country = req.body.country;
		let club_id = req.body.club_id;
        let query = "UPDATE `managers` SET `age` = " + age + ", `country` = '" + country + "' , `club_id` = " + club_id + " WHERE manager_id = '" + manager_id + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/manager/display');
			console.log("successfully edited")
        });
    }

function deleteManager(req, res){
		let curr_user_id = req.session.user_id;
        let manager_id = req.params.id;
		let ini_qeury = 'SELECT * from `managers` WHERE manager_id = "' + manager_id + '"';
        let getImageQuery = 'SELECT image from `managers` WHERE manager_id = "' + manager_id + '"';
        let deleteManagerQuery = 'DELETE FROM managers WHERE manager_id = "' + manager_id + '"';

        db.query(ini_qeury, (err,result12)=>{
		if (err) {
                return res.status(500).send(err);
            }
		else{
			
			let post_user= result12[0].user_id;
			console.log(post_user);
			if(curr_user_id == post_user){
	
				db.query(getImageQuery, (err, result) => {
					if (err) {
						return res.status(500).send(err);
					}

					let image = result[0].image;

					fs.unlink(`public/assets/img/${image}`, (err) => {
						if (err) {
							return res.status(500).send(err);
						}
						db.query(deleteManagerQuery, (err, result) => {
							if (err) {
								return res.status(500).send(err);
							}
							res.redirect('/manager/display');
							console.log("successfully deleted")
						});
					});
				});
			}
			else{
				let message= "You cannot delete this manager because this entry was not made by you!!"
				res.render("error_page",{message:message});
			}
		}
		});
    }


//player functions
function displayAllPlayer(req, res) {
	var name_var;
	var result = {};
	var newobj = {};
        let query = "SELECT * FROM `players` ORDER BY player_id ASC"; // query database to get all the players
	db.query(query, (err, result, feilds) => {
            if (err) {
                res.redirect('/');
				console.log(err);
            }
            res.render('player/display-players', {players: result});
        });
	

}

function addPlayer(req, res){
       	let user_id = req.session.user_id;
        let message = '';
		let player_id = req.body.player_id;
        let name = req.body.name;
        let age = req.body.age;
        let position = req.body.position;
        let country = req.body.country;
        let club_id = req.body.club_id;
		let manager_id = req.body.manager_id;
        let uploadedFile = req.files.image;
        let image_name = uploadedFile.name;
        let fileExtension = uploadedFile.mimetype.split('/')[1];
        image_name = player_id + '.' + fileExtension;

        let usernameQuery = "SELECT * FROM `players` WHERE player_id = '" + player_id + "'";

        db.query(usernameQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
				message= "Player with given ID already exists. enter unique Player ID"
                res.render("error_page",{message:message});
                console.log('player already exists');
            } 
			else {
                // check the filetype before uploading it
                if (uploadedFile.mimetype === 'image/png' || uploadedFile.mimetype === 'image/jpeg' || uploadedFile.mimetype === 'image/gif') {
                    // upload the file to the /public/assets/img directory
                    uploadedFile.mv(`public/assets/img/${image_name}`, (err ) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                        // send the player's details to the database
                        let query = "INSERT INTO `players` (player_id, player_name, age, position,country, club_id, manager_id, image, user_id) VALUES ('" + player_id + "', '" + name + "', '" + age + "', '" + position + "', '" + country + "', '" + club_id + "', '" + manager_id + "', '" + image_name + "', '"+ user_id +"')";
                        db.query(query, (err, result) => {
                            if (err) {
                                return res.status(500).send(err);
                            }
                            res.redirect('/player/display');
                        });
                    });
                } else {
                    message = "Invalid File format. Only 'gif', 'jpeg' and 'png' images are allowed.";
                res.render("error_page",{message:message});
                }
            }
        });
    }

function editPlayerPage(req, res){
		let curr_user_id = req.session.user_id;
        let player_id = req.params.id;
        let query = "SELECT * FROM `players` WHERE player_id = '" + player_id + "' ";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
			let post_user= result[0].user_id;
			console.log(post_user);
			if(curr_user_id == post_user){
            res.render('player/edit-players', {player: result});
			}
			else{
				let message= "You cannot edit this player because this entry was not made by you!!"
				res.render("error_page",{message:message});
			}
        });
    }

function editPlayer(req, res){
		
        let player_id = req.params.id;
        let name = req.body.player_name;
        let age = req.body.age;
        let position = req.body.position;
        let country = req.body.country;
		let club_id = req.body.club_id;
		let manager_id = req.body.manager_id;
		console.log(req.body);
		console.log(player_id);
		
        let query = "UPDATE `players` SET `age` = " + age + ", `position` = '" + position + "', `country` = '" + country + "' , `club_id` = " + club_id + ", `manager_id` = " + manager_id + " WHERE player_id = '" + player_id + "'";
        db.query(query, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            res.redirect('/player/display');
			console.log("successfully edited")
        });
    }

function deletePlayer(req, res){
		let curr_user_id = req.session.user_id;
        let player_id = req.params.id;
		let ini_qeury = 'select * from players where player_id= "' + player_id + '"';
        let getImageQuery = 'SELECT image from `players` WHERE player_id = "' + player_id + '"';
        let deleteUserQuery = 'DELETE FROM players WHERE player_id = "' + player_id + '"';

    db.query(ini_qeury, (err,result12)=>{
		if (err) {
                return res.status(500).send(err);
            }
		else{
			
			let post_user= result12[0].user_id;
			console.log(post_user);
			if(curr_user_id == post_user){
			
				db.query(getImageQuery, (err, result) => {
					if (err) {
						return res.status(500).send(err);
					}

					let image = result[0].image;

					fs.unlink(`public/assets/img/${image}`, (err) => {
						if (err) {
							return res.status(500).send(err);
						}
						db.query(deleteUserQuery, (err, result) => {
							if (err) {
								return res.status(500).send(err);
							}
							res.redirect('/player/display');
							console.log("successfully deleted")
						});
					});
				});
			}
			else{
				let message= "You cannot delete this player because this entry was not made by you!!"
				res.render("error_page",{message:message});
			}
		}
		});

    }


//match functions
function displayAllMatch(req, res) {
        let query = "SELECT * FROM `matches` ORDER BY match_date ASC"; // query database to get all the players
        db.query(query, (err, result, feilds) => {
            if (err) {
                res.redirect('/');
				console.log(err);
            }
            res.render('match/display-matches', {matches: result});
        });
    }

function addMatch(req, res){
       	let user_id = req.session.user_id;
        let message = '';
		let match_id = req.body.match_id;
        let date = req.body.match_date;
		let home_score = req.body.home_score;
		let away_score = req.body.away_score;	
		let home_id = req.body.home_id;
		let away_id = req.body.away_id;
        
	let MatchQuery = "SELECT * FROM `matches` WHERE match_id = '" + match_id + "'";

        db.query(MatchQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
				message= "Match with given ID already exists. enter unique Match ID"
                res.render("error_page",{message:message});
               
            } 
			else {
                    let query = "INSERT INTO `matches` (match_id, match_date, home_score, away_score, home_id, away_id,user_id ) VALUES ('" + match_id + "', '" + date + "', '" + home_score + "', '" + away_score + "', '" + home_id + "' , '" + away_id + "', '" + user_id + "')";
                    db.query(query, (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                            res.redirect('/match/display');
                    });
			}
        });
    }


//goals function
function displayGoal(req, res) {
		let match_id = req.params.id;
        let query = "SELECT * FROM `goals` where match_id = '" + match_id + "' "; // query database to get all the players
        db.query(query, (err, result, feilds) => {
            if (err) {
                res.redirect('/');
				console.log(err);
            }
            res.render('goal/display-goal', {goal: result});
        });
    }

function addGoal(req, res){
       	let user_id = req.session.user_id;
        let goal_id = req.body.goal_id;
		let match_id = req.body.match_id;
        let time = req.body.time;
		let player_id = req.body.player_id;
        
	let GoalQuery = "SELECT * FROM `goals` WHERE goal_id = '" + goal_id + "'";

        db.query(GoalQuery, (err, result) => {
            if (err) {
                return res.status(500).send(err);
            }
            if (result.length > 0) {
				message= "Goal with given ID already exists. enter unique Goal ID"
                res.render("error_page",{message:message});
                
            } 
			else {
                    let query = "INSERT INTO `goals` (goal_id, goal_time, match_id, player_id, user_id ) VALUES ('" + goal_id + "' , '" + time + "', '" + match_id + "', '" + player_id + "', '" + user_id + "')";
                    db.query(query, (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
                            res.redirect('/goal/display/'+match_id);
                    });
			}
        });
    }


const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        return res.redirect('/login')
    }
    next();
}


app.get('/register', (req, res) => {
    res.render('register')
})


app.post('/register', async (req, res)=> {
    const  password=req.body.password;
	const username  = req.body.username;
	let query = "SELECT * FROM `users` where username = '" + username + "' ";
	let query1 = "SELECT * FROM `users` ";
	var x,result,result1;
	db.query(query, async (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
						else{
							if(result.length>0){
								var message= "Username already taken!! Please select another username..";
								res.render("error_page",{message:message} );
							}
							else{
								db.query(query1, (err, result1) => {
								if (err) {
								return res.status(500).send(err);
								}
									x= result1.length + 1;
								});
								let passwordhash = await bcrypt.hash(password, 12);
								let query = "INSERT INTO `users` VALUES ('" + x + "' , '" + username + "' , '" + passwordhash + "')";
								db.query(query, (err, result) => {
                        			if (err) {
                            			return res.status(500).send(err);
                       				 }
                    			});
    							req.session.user_id =x;
   								res.redirect('/index');
							}
						}
	});
    //const user = new User({ username, password });
	
})

app.get('/login', (req, res) => {
	if(req.session.user_id){
		var message= "User already signed in. logout first to login with another credentials."
		return res.render("error_page",{message:message});
	}
    res.render('login')
})

app.post('/login', async (req, res)=> {
    const username = req.body.username;
	const password  = req.body.password;	
	let query = "SELECT * FROM `users` where username = '" + username + "' ";
	let query1 = "SELECT * FROM `users` where username = '" + username + "' ";
	var result1,result;
	db.query(query, async (err, result) => {
                        if (err) {
                            return res.status(500).send(err);
                        }
						else{
							if(result.length==1){
								const isValid = await bcrypt.compare(password, result[0].password);
   								if (isValid){
									req.session.user_id = result[0].user_id;
									res.redirect('/index');
								} else{
										res.redirect('/login')
								}
							}
							else{
							res.redirect("/register");
							}
						}
									
                });
							
})

app.post('/logout', (req, res) => {
	// if(req.session.user_id){
	// 	var message= "User not signed in yet. Sign in first to logout."
	// 	res.render("error_page",{message:message});
	// }
	//else{
		//req.session.user_id = null;
		req.session.destroy();
		res.redirect('/login');
	//}
})

//routes
//index route
app.get("/",function(req,res){
	res.render("Page-1");
});

app.get("/index",function(req,res){
	res.render("index");
});

app.get("/a",function(req,res){
	res.render("a");
})

//club routes
app.get("/club",function(req,res){
	res.render("club/clubHome");
});

app.get("/club/display",displayAllClub,function(req,res){
	res.render("club/display-clubs");
});

app.get("/club/count",displayClubCount,function(req,res){
	res.render("club/clubs-count");
});

app.get("/club/add",requireLogin,function(req,res){
	res.render("club/add-clubs");
});

app.post("/club/add", addClub,function(req,res){
	console.log("added club");
});

app.get("/club/delete/:id",requireLogin,deleteClub, function(req,res){
});


//manager routes
app.get("/manager",function(req,res){
	res.render("manager/managerHome");
});

app.get("/manager/display",displayAllManager,function(req,res){
	res.render("display-managers");
});

app.get("/manager/add",requireLogin,function(req,res){
	res.render("manager/add-managers");
});

app.post("/manager/add",requireLogin, addManager,function(req,res){
	console.log("added");
});

app.get("/manager/edit/:id",requireLogin,editManagerPage, function(req,res){
	
});

app.post("/manager/edit/:id",requireLogin,editManager, function(req,res){
	console.log("successful edited")
});

app.get("/manager/delete/:id",requireLogin,deleteManager, function(req,res){
});


//player routes
app.get("/player",function(req,res){
	res.render("player/playerHome");
});

app.get("/player/display",displayAllPlayer,function(req,res){
	res.render("player/display-players");
});

app.get("/player/add",requireLogin,function(req,res){
	res.render("player/add-players");
});

app.post("/player/add",requireLogin, addPlayer,function(req,res){
	console.log("added");
});

app.get("/player/edit/:id",requireLogin,editPlayerPage, function(req,res){
	
});

app.post("/player/edit/:id",requireLogin,editPlayer, function(req,res){
	console.log("successful edited")
});

app.get("/player/delete/:id",requireLogin,deletePlayer, function(req,res){
});


//match routes
app.get("/match",function(req,res){
	res.render("match/matchHome");
});

app.get("/match/display",displayAllMatch,function(req,res){
	res.render("match/display-matches");
});

app.get("/match/add",requireLogin,function(req,res){
	res.render("match/add-matches");
});

app.post("/match/add", requireLogin,addMatch,function(req,res){
	console.log("added match");
});


//goal routes
app.get("/goal/display/:id",displayGoal,function(req,res){
	res.render("goal/display-goals");
});

app.get("/goal/add",requireLogin,function(req,res){
	res.render("goal/add-goals");
});

app.post("/goal/add",requireLogin, addGoal,function(req,res){
	console.log("added Goal");
});

//server listening on port 3000
app.listen(3000, function(){
    console.log("SERVER IS RUNNING!");
});


