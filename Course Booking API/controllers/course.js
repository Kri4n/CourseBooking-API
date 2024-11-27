//[SECTION] Activity: Dependencies and Modules
const Course = require("../models/Course.js");

const { errorHandler } = require('../auth.js');

//[SECTION] Activity: Create a course
/*
Steps: 
1. Instantiate a new object using the Course model and the request body data
2. Save the record in the database using the mongoose method "save"
3. Use the "then" method to send a response back to the client appliction based on the result of the "save" method
*/
module.exports.addCourse = (req, res) => {
    
    // try{
    //     // Creates a variable "newCourse" and instantiates a new "Course" object using the mongoose model
    //     // Uses the information from the request body to provide all the necessary information
    //     let newCourse = new Course({
    //         name : req.body.name,
    //         description : req.body.description,
    //         price : req.body.price
    //     });
    
    //     // Saves the created object to our database
    //     return newCourse.save()
    //     .then(result => res.send(result))
    //     // Error handling is done using .catch() to capture any errors that occur during the course save operation.
    
    //     // .catch(err => err) captures the error but does not take any action, it's only capturing the error to pass it on to the next .then() or .catch() method in the chain. Postman is waiting for a response to be sent back to it but is not receiving anything.
    //     // .catch.catch(err => res.send(err)) captures the error and takes action by sending it back to the client/Postman with the use of "res.send"
    //     .catch(err => res.send(err))
    
    // } catch (err) {
    //     console.log("result in console.error");
    //     console.error(err);
    //     //In a development or debugging context, sending the actual error object might be useful, but in a production environment, it's better to provide a user-friendly and secure error response. 
    
    //     //In practice, you would tailor your error handling based on your application's requirements, security considerations, and the level of detail you want to expose to clients.
    
    //     /*
    //     Use console.error when:
    
    //             - You want to log the error for debugging and monitoring purposes, especially in production environments.
    //             - You need to log additional information or stack traces that can aid in debugging.
    //             - The information is not suitable or safe to be exposed to end-users.
    
    //     The practice of separating console logging for developers and sending clear, user-friendly error messages to clients is a good approach for handling errors in an Express.js controller.
    //     */
    //     res.send("Error in Variables");
    // }
    
    let newCourse = new Course({
        name : req.body.name,
        description : req.body.description,
        price : req.body.price
    });
    
    Course.findOne({name: req.body.name})
    .then(existingCourse => {
        if (existingCourse) {
            // Notice that we didn't response directly in string, instead we added an object with a value of a string. This is a proper response from API to Client. Direct string will only cause an error when connecting it to your frontend.
            return res.status(409).send({message: 'Course already exists'});
            
        }else {
            // Saves the created object to our database
            return newCourse.save()
            //add status 201
            .then(result => res.status(201).send({
                success: true,
                message: 'Course added successfully',
                result: result
            }))
            // Error handling is done using .catch() to capture any errors that occur during the course save operation.
            
            // .catch(err => err) captures the error but does not take any action, it's only capturing the error to pass it on to the next .then() or .catch() method in the chain. Postman is waiting for a response to be sent back to it but is not receiving anything.
            // .catch.catch(err => res.send(err)) captures the error and takes action by sending it back to the client/Postman with the use of "res.send"
        }
    }).catch(err => errorHandler(err, req, res))
}; 


//[SECTION] Activity: Retrieve all courses
/*
Steps: 
1. Retrieve all courses using the mongoose "find" method
2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllCourses = (req, res) => {
    
    return Course.find({})
    .then(result => {
        // if the result is not null send status 200 and its result
        if(result.length > 0){
            return res.status(200).send(result);
        }
        else{
            // 404 for not found courses
            return res.status(404).send({message: 'No courses'});
        }
    })
    .catch(error => errorHandler(error, req, res));
    
};



//[SECTION] Retrieve all active courses
/*
Steps: 
1. Retrieve all courses using the mongoose "find" method with the "isActive" field values equal to "true"
2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getAllActive = (req, res) => {
    
    Course.find({ isActive : true }).then(result => {
        if (result.length > 0){
            //if the course is active, return the course.
            return res.status(200).send(result);
        }
        else {
            //if there is no active courses, return 'No active courses found'.
            return res.status(200).send({ message: 'No active courses found' });
        }
    }).catch(err => res.status(500).send(err));
    
    
    
};



//[SECTION] Retrieve a specific course
/*
Steps: 
1. Retrieve a course using the mongoose "findById" method
2. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.getCourse = (req, res) => {
    
    Course.findById(req.params.courseId)
    .then(course => {
        if (course) {
            //if the course is found, return the course.
            return res.status(200).send(course);
        } else {
            //if the course is not found, return 'Course not found'.
            return res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res)); 
    
};


//[SECTION] Update a course
/*
Steps: 
1. Create an object containing the data from the request body
2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
3. Use the "then" method to send a response back to the client appliction based on the result of the "find" method
*/
module.exports.updateCourse = (req, res)=>{
    
    let updatedCourse = {
        name: req.body.name,
        description: req.body.description,
        price: req.body.price
    }
    
    // findByIdandUpdate() finds the the document in the db and updates it automatically
    // req.body is used to retrieve data from the request body, commonly through form submission
    // req.params is used to retrieve data from the request parameters or the url
    // req.params.courseId - the id used as the reference to find the document in the db retrieved from the url
    // updatedCourse - the updates to be made in the document
    return Course.findByIdAndUpdate(req.params.courseId, updatedCourse)
    .then(course => {
        if (course) {
            //if the course is found, return the course and send a message 'Course updated successfully'.
            res.status(200).send({ success: true, message: 'Course updated successfully' });
        } else {
            //if the course is not found, return 'Course not found'.
            res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

//[SECTION] Archive a course
/*
Steps: 
1. Create an object and with the keys to be updated in the record
2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
3. If a course is updated send a response of "true" else send "false"
4. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.archiveCourse = (req, res) => {
    
    let updateActiveField = {
        isActive: false
    };
    
    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
    .then(course => {
        if (course) {
            if (!course.isActive) {
                //if the course isActive is already false, send a message 'Course already archived' and return the course.
                return res.status(200).send({ 
                    message: 'Course already archived',
                    course: course
                });
            }
            //if the course is successfully archived, return true and send a message 'Course archived successfully'.
            return res.status(200).send({ 
                success: true, 
                message: 'Course archived successfully'
            });
        } else {
            //if the course is not found, return 'Course not found'
            return res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};


//[SECTION] Activate a course
/*
Steps: 
1. Create an object and with the keys to be updated in the record
2. Retrieve and update a course using the mongoose "findByIdAndUpdate" method, passing the ID of the record to be updated as the first argument and an object containing the updates to the course
3. If the user is an admin, update a course else send a response of "false"
4. If a course is updated send a response of "true" else send "false"
5. Use the "then" method to send a response back to the client appliction based on the result of the "findByIdAndUpdate" method
*/
module.exports.activateCourse = (req, res) => {
    
    let updateActiveField = {
        isActive: true
    }
    
    Course.findByIdAndUpdate(req.params.courseId, updateActiveField)
    .then(course => {
        if (course) {
            if (course.isActive) {
                // if the course isActive is already true, send a message 'Course already activated', and return the course.
                return res.status(200).send({ 
                    message: 'Course already activated', 
                    course: course
                });
            }
            //if the course is successfully activated, return true and send a message 'Course activated successfully'.
            return res.status(200).send({
                success: true,
                message: 'Course activated successfully'
            });
        } else {
            // if the course is not found, return 'Course not found'
            return res.status(404).send({ message: 'Course not found' });
        }
    })
    .catch(error => errorHandler(error, req, res));
};

module.exports.searchCoursesByName = async (req, res) => {
    try {
        const { courseName } = req.body;
        
        // Use a regular expression to perform a case-insensitive search
        const courses = await Course.find({
            name: { $regex: courseName, $options: 'i' }
        });
        
        res.json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

module.exports.searchCoursesByPriceRange = async (req, res) => {
    try {
        const { minPrice, maxPrice } = req.body;
        
        // Find courses with prices within the specified range
        const courses = await Course.find({
            price: { $gte: minPrice, $lte: maxPrice }
        });
        
        res.status(200).json(courses);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
