// [SECTION] Dependencies and Modules
const User = require("../models/User.js");
const bcrypt = require('bcrypt');
const auth = require("../auth"); 
const Enrollment = require("../models/Enrollment.js");

const { errorHandler } = auth;

// The functions will be placed here

//[SECTION] User registration
/*
    Steps:
    1. Create a new User object using the mongoose model and the information from the request body
    2. Make sure that the password is encrypted
    3. Save the new User to the database
*/
module.exports.registerUser = (req, res) => {
    // Checks if the email is in the right format
    if (!req.body.email.includes("@")){
        // if the email is not in the right format, send a message 'Invalid email format'.
        return res.status(400).send({ message: 'Invalid email format' });
    }
    // Checks if the mobile number has the correct number of characters
    else if (req.body.mobileNo.length !== 11){
        // if the mobile number is not in the correct number of characters, send a message 'Mobile number is invalid'.
        return res.status(400).send({ message: 'Mobile number is invalid' });
    }
    // Checks if the password has atleast 8 characters
    else if (req.body.password.length < 8) {
        // If the password is not atleast 8 characters, send a message 'Password must be atleast 8 characters long'.
        return res.status(400).send({ message: 'Password must be atleast 8 characters long' });
    // If all needed requirements are achieved
    } else {
        let newUser = new User({
            firstName : req.body.firstName,
            lastName : req.body.lastName,
            email : req.body.email,
            mobileNo : req.body.mobileNo,
            password : bcrypt.hashSync(req.body.password, 10)
        })

        return newUser.save()
        // if all needed requirements are achieved, send a success message 'User registered successfully' and return the newly created user.
        .then((result) => res.status(201).send({
            message: 'User registered successfully',
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};


// User authentication - with bcrypt
/*
    Steps:
    1. Check the database if the user email exists
    2. Compare the password provided in the login form with the password stored in the database
    3. Generate/return a JSON web token if the user is successfully logged in and return false if not
*/
//[SECTION] User authentication
module.exports.loginUser = (req, res) => {
    if(req.body.email.includes("@")){
        return User.findOne({ email : req.body.email })
        .then(result => {
            if(result == null){
                // if the email is not found, send a message 'No email found'.
                return res.status(404).send({ message: 'No email found' });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);
                if (isPasswordCorrect) {
                    // if all needed requirements are achieved, send a success message 'User logged in successfully' and return the access token.
                    return res.status(200).send({ 
                        message: 'User logged in successfully',
                        access : auth.createAccessToken(result)
                        })
                } else {
                    // if the email and password is incorrect, send a message 'Incorrect email or password'.
                    return res.status(401).send({ message: 'Incorrect email or password' });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    } else{
        // if the email used in not in the right format, send a message 'Invalid email format'.
        return res.status(400).send({ message: 'Invalid email format' });
    }
};


// loginUser - no bcrypt
/*
	module.exports.loginUser = (reqBody) => {
    return User.findOne({ email: reqBody.email })
    .then(result => {
        // User does not exist
        if (result == null) {
            return false;
        } else {
            // Directly compare the provided password with the stored password
            const isPasswordCorrect = reqBody.password === result.password;

            // If the passwords match
            if (isPasswordCorrect) {
                // Generate an access token
                return { access: auth.createAccessToken(result) };
            } else {
                // Passwords do not match
                return false;
            }
        }
    })
    .catch(err => err);
};
	
*/


//[SECTION] Check if the email already exists
/*
    Steps: 
    1. Use mongoose "find" method to find duplicate emails
    2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.checkEmailExists = (req, res) => {
    if (req.body.email.includes("@")) {   
        return User.find({ email : req.body.email })
        .then(result => {

            if (result.length > 0) {
                return res.status(409).send({message: "Duplicate email found"});
            } else {
                return res.status(404).send({message:  "No duplicate email found"});
            };
        })
        .catch(err => errorHandler(err, req, res));
    } else {
        res.status(400).send({message: "Invalid email format"})
    }
};





//[Section] Activity: Retrieve user details
/*
    Steps:
    1. Retrieve the user document using it's id
    2. Change the password to an empty string to hide the password
    3. Return the updated user record
*/
module.exports.getProfile = (req,res) => {

    // The "return" keyword ensures the end of the getProfile method.
    // Since getProfile is now used as a middleware it should have access to "req.user" if the "verify" method is used before it.
    // Order of middlewares is important. This is because the "getProfile" method is the "next" function to the "verify" method, it receives the updated request with the user id from it.
     return User.findById(req.user.id)
    .then(user => {

        if(!user){
            // if the user has invalid token, send a message 'invalid signature'.
            return res.status(403).send({ message: 'invalid signature' })
        }else {
            // if the user is found, return the user.
            user.password = "";
            return res.status(200).send(user);
        }  
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Enroll a user to a course
module.exports.enroll = (req, res) => {
    // the users id from the decoded token after verify()
    console.log(req.user.id);
    // the course from our request body
    console.log(req.body.enrolledCourses);

    if(req.user.isAdmin){
        // if the user is an admin, send a message 'Admin is forbidden'.
        return res.status(403).send({ message: 'Admin is forbidden' });
    }

    let newEnrollment = new Enrollment ({
        userId : req.user.id,
        enrolledCourses: req.body.enrolledCourses,
        totalPrice: req.body.totalPrice
    })

    return newEnrollment.save()
    .then(enrolled => {
        // if the user successfully enrolled,return true and send a message 'Enrolled successfully'.
        return res.status(201).send({
            success: true,
            message: 'Enrolled successfully'
        });
    })
    .catch(error => errorHandler(error, req, res));
}



//[SECTION] Activity: Get enrollments
/*
    Steps:
    1. Use the mongoose method "find" to retrieve all enrollments for the logged in user
    2. If no enrollments are found, return a 404 error. Else return a 200 status and the enrollment record
*/
module.exports.getEnrollments = (req, res) => {
    return Enrollment.find({userId : req.user.id})
        .then(enrollments => {
            if (enrollments.length > 0) {
                // if there are enrolled courses, return the enrollments.
                return res.status(200).send(enrollments);
            }
            // if there is no enrolled courses, send a message 'No enrolled courses'.
            return res.status(404).send({
                message: 'No enrolled courses'
            });
        })
        .catch(error => errorHandler(error, req, res));
};

// CHATGPT CODE
module.exports.resetPassword = async (req, res) => {
    try {

        console.log(req.body);
        console.log(req.user);
        const { newPassword } = req.body;
        const { id } = req.user; // Extracting user ID from the authorization header

        // Hashing the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Updating the user's password in the database
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        // Sending a success response
        res.status(200).send({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: 'Internal server error' });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
      // Get the user ID from the authenticated token
      const userId = req.user.id;
  
      // Retrieve the updated profile information from the request body
      const { firstName, lastName, mobileNo } = req.body;
  
      // Update the user's profile in the database
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { firstName, lastName, mobileNo },
        { new: true }
      );
  
      res.send(updatedUser);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  }

module.exports.updateAsAdmin = async (req, res) => {
    try {
        const { userId } = req.body; // Extract user ID from the request body
    
        // Find the user and set isAdmin to true
        const updatedUser = await User.findByIdAndUpdate(
          userId,
          { isAdmin: true },
          { new: true }
        );
    
        if (!updatedUser) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        // Return success message if update is successful
        res.json({ message: 'User updated as admin successfully'});
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};