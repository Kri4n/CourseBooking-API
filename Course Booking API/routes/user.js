// [SECTION] Dependencies and Modules
const express = require("express");
const userController = require("../controllers/user.js");
// Google Login
const passport = require('passport');
const { verify, verifyAdmin, isLoggedIn } = require("../auth.js");

// [SECTION] Routing Component
const router = express.Router();

// Routes will be placed here


// Route for user registration`
router.post("/register", userController.registerUser);

//
router.post("/login", userController.loginUser);

//[SECTION] Activity: Routes for duplicate email
router.post("/check-email", userController.checkEmailExists);

//[Section] Activity: Route for retrieving user details
router.get("/details", verify, verifyAdmin, userController.getProfile);

// [SECTION] Route to enroll a user to a course
router.post('/enroll', verify, userController.enroll);

//[SECTION] Activity: Route to get the user's enrollments array
router.get('/get-enrollments', verify, userController.getEnrollments);

//[SECTION] Google Login
//[SECTION] Route for initiating the Google OAuth consent screen
router.get('/google',
    // Uses the "authenticate" method of passport to verify the email credentials in Google's APIs
    passport.authenticate('google', {
        // Scopes that are allowed when retriving user data
        scope: ['email', 'profile'],
        // Allows the OAuth consent screen to be "prompted" when the route is accessed to select a new account every time the user tries to login.
        // Comment this out and access this route twice to see the difference
        // If removed, automatically redirects the user to "/google/success" route
        // If added, always returns the OAuth consent screen to allow the user to choose an account
        prompt : "select_account"
    }
));

//[SECTION] Route for callback URL for Google OAuth authentication
router.get('/google/callback',
    // If authentication is unsuccessful, redirect to "/users/failed" route
    passport.authenticate('google', {
        failureRedirect: '/users/failed',
    }),
    // If authentication is successful, redirect to "/users/success" route
    function (req, res) {
        res.redirect('/users/success')
    }
);

//[SECTION] Route for failed Google OAuth authentication
router.get("/failed", (req, res) => {
    console.log('User is not authenticated');
    res.send("Failed")
})

//[SECTION] Route for successful Google OAuth authentication
router.get("/success", isLoggedIn, (req, res) => {
    console.log('You are logged in');
    console.log(req.user);
    res.send(`Welcome ${req.user.displayName}`)
})

//[SECTION] Route for logging out of the application
// The logout route does only logs the user out of the application and destroys the session, but upon trying to access the "/google" route again, the user is no longer prompted to choose an email to login if the "prompt : "select_account" option is not added to the "/google" route. This is expected behaviour because the Google OAuth 2, already allows the user access to the "Course Booking API" because the user has been authorized to access the app.
// Navigate to the Google App Permissions to delete all connections with the app (https://myaccount.google.com/connections)
router.get("/logout", (req, res) => {
    // Destroys the session that stores the Google OAuth Client credentials
    // Allows for release of resources when the account information is no longer needed in the browser
    req.session.destroy((err) => {
        if (err) {
            console.log('Error while destroying session:', err);
        } else {
            req.logout(() => {
                console.log('You are logged out');
                // Redirects the page to "http://localhost:4000" route to visual redirection in frontend.
                // Can be replaced in the future with the "home" page route for the frontend.
                res.redirect('/');
            });
        }
    });
});


// Route for resetting user password
router.post('/reset-password', verify, userController.resetPassword);

// Update user profile route
router.put('/profile', verify, userController.updateProfile);

// Route for an admin to promote another user to admin
router.put('/updateAdmin', verify, verifyAdmin, userController.updateAsAdmin);

// [SECTION] Export Route System
module.exports = router;