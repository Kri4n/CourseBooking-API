// [SECTION] Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
// Google Login
const passport = require('passport');
const session = require('express-session');
require('./passport.js');

const userRoutes = require("./routes/user.js");
//[SECTION] Activity: Allows access to routes defined within our application
const courseRoutes = require("./routes/course.js");

// [SECTION] Environment Setup
// const port = 4000;
require('dotenv').config();

// [SECTION] Server Setup
// Creates an "app" variable that stores the result of the "express" function that initializes our express application and allows us access to different methods that will make backend creation easy
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
// Allows all resources to access our backend application
// app.use(cors());

// You can also customize CORS options to meet your specific requirements
const corsOptions = {
	origin: ['http://localhost:8000','http://localhost:4000', 'http://localhost:3000'],//allow requests from this origin
	credentials: true, // Allows credentials(cookies, authorization headers)
	optionsSuccessStatus: 200 // Provides a status code to use for successful options request
}

app.use(cors(corsOptions));

// [Section] Google Login
// Creates a session with the given data
app.use(session({
	secret: process.env.clientSecret,
	resave: false,
	saveUninitialized: false
}))

app.use(passport.initialize());
app.use(passport.session());

// [SECTION] Database Connection
mongoose.connect(process.env.MONGODB_STRING, {
});

mongoose.connection.once('open', () => console.log('Now Connected to MongoDB Atlas.'))

// [SECTION] Backend Routes
// Groups all routes in userRoutes under "/users"
app.use("/users", userRoutes);
//[SECTION] Activity: Add course routes
app.use("/courses", courseRoutes);

// [SECTION] Server Gateway Response
if(require.main === module){
	// "process.env.PORT || 3000" will use the environment variable if it is available OR will used port 3000 if none is defined
    // This syntax will allow flexibility when using the application locally or as a hosted application
	app.listen( process.env.PORT || 3000, () => {
		console.log(`API is now online on port ${process.env.PORT || 3000}`)
	});
	
}


module.exports = {app, mongoose};