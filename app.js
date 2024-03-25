const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const path = require('path');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

const app = express();
const otps = {};
const port = process.env.PORT || 3000;

// Create a MySQL connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'createaccount',
  port: '3307', // Change the port as needed
});

// Create the 'accounts' table for account registration
db.connect((err) => {
  if (err) {
    console.log('MySQL connection failed: ' + err.message);
  } else {
    console.log('Connected to MySQL');
  }
});

app.get('/', (req, res) => {
  res.render('login');
});

app.get('/signup', (req, res) => {
  res.render('register');
});

app.get('/forgot-password', (req, res) => {
  res.render('forgotpass');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname));



// ---------------------------------REGISTER--------------------------------
app.post('/register', (req, res) => {
  const { name, email, phonenumber, dob, gender, password } = req.body;

  const sql = 'INSERT INTO accounts (name, email, phonenumber, dob, gender, password) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, email, phonenumber, dob, gender, password], (err, result) => {
    if (err) {
      console.error('MySQL query error: ' + err.message);
      res.send('Registration failed. Please try again.');
    } else {
      // res.send('Registration successful. You can now log in.');
      res.render('login');
    }
  });
});

// ---------------------------------LOGIN--------------------------------

app.post('/login', (req, res) => {
  const identifier = req.body.identifier; // Retrieve the user identifier from the session
  const password = req.body.password; // Retrieve the password from the session

  // const { identifier, password } = req.body;
  const isEmail = isValidEmail(identifier);
  const isMobile = isValidMobileNumber(identifier);

  console.log('identifier: ' + identifier);
  console.log('password: ' + password);
  console.log('isEmail: ' + isEmail);
  if (isEmail || isMobile) {
    let sql, identifierType;

    if (isEmail) {
      sql = 'SELECT * FROM accounts WHERE email = ? AND password = ?';
      identifierType = 'email';
    } else {
      sql = 'SELECT * FROM accounts WHERE phonenumber = ? AND password = ?';
      identifierType = 'phone number';
    }

    db.query(sql, [identifier,password], (err, result) => {
      if (err) {
        console.log('MySQL query error: ' + err.message);
        res.send('Login failed. Please try again.');
        // res.send('Failed to fetch user information.');
      } else {
        if (result.length === 1) {
          const user = result[0];
          res.render('dashboard', { name: user.name });
        } else {
          res.send(`User with ${identifierType} not found.`);
        }
      }
    });
  } else {
    res.send('Invalid input. Please enter either an email or phone number.');
  }
});

  
  function isValidEmail(input) {
    // Regular expression for validating an email address
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
    return emailRegex.test(input);
  }
  
  function isValidMobileNumber(input) {
    // Regular expression for validating a mobile number (10 digits)
    const mobileRegex = /^\d{10}$/;
    return mobileRegex.test(input);
  }

  // -------------------SEND OTP CODE--------------------------


  // Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Change to your email service provider
  auth: {
    user: 'demo@gmail.com', // Replace with your email
    pass: '123456789', // Replace with your email password
  },
  secure: true,
});

app.post('/send-otp', (req,res) => {
  const identifier = req.body.identifier;
  
    if (isValidEmail(identifier)) {
      // It's an email, perform email-related logic
      const sql = 'SELECT * FROM accounts WHERE email = ?';
      db.query(sql, [identifier], (err, rows) => {
        if (err) {
          console.error(err);
          res.send('An error occurred while checking the email.');
        } 
        else if (rows.length > 0) {
          const otp = generateNumericOTP(6);
          otps[identifier] = {
            otp,
            createdAt: Date.now(),
          };
          const mailOptions = {
            from: 'demo@gmail.com',//your email id
            to: identifier,
            subject: 'Your OTP for Email Verification',
            text: `Your OTP is: ${otp}`,
          };
  
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error(error);
              res.send('Failed to send OTP. Please try again.');
            } else {
              console.log(`Email sent: ${info.response}`);
              res.render('otp', { identifier, storedOTP: otp });
            }
          });
        } 
        else {
          res.send('No such email found in the database. Please sign up.');
        }
      });
    } 
    else if (isValidMobileNumber(identifier)) {
      // It's a mobile number, perform mobile-related logic
      const sql = 'SELECT * FROM accounts WHERE phonenumber = ?';
      db.query(sql, [identifier], (err, rows) => {
        if (err) {
          console.error(err);
          res.send('An error occurred while checking the phone number.');
        }
        else if (rows.length > 0) {
          const otp = generateNumericOTP(6);
          otps[identifier] = {
            otp,
            createdAt: Date.now(),
          };
          // You would use your SMS gateway provider's API here to send the OTP via SMS
          // Replace the placeholder code below with your actual SMS sending logic.
          sendSMSOTP("+91"+identifier, otp, (smsError, smsResponse) => {
            if (smsError) {
              console.error(smsError);
              res.send('Failed to send SMS OTP. Please try again.');
            } else {
              console.log('SMS sent:', smsResponse);
              // res.render('otp', { identifier, storedOTP: otp });
            }
          });
        } 
        else {
          res.send('No such phone number found in the database. Please sign up.');
        }
      });
    } 
    else {
      res.send('Invalid input. Please enter either an email or mobile number.');
    }
  
  function generateNumericOTP(length) {
    const chars = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      otp += chars.charAt(randomIndex);
    }
    return otp;
  }
  
  function sendSMSOTP(mobile, otp, callback) {
    // Implement your SMS gateway provider's API to send the OTP via SMS here
    // You can use Twilio, Nexmo, or any other SMS gateway provider.
    // Replace the following placeholder code with the actual implementation.
    // Example placeholder code:
    const accountSid = 'ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
    const authToken = 'your_auth_token';
    const client = new twilio(accountSid, authToken);
  
    client.messages
      .create({
        body: `Your OTP is: ${otp}`,
        from: '+13343262485',
        to: mobile,
      })
      .then((message) => {
        console.log('Message sent. SID: ' + message.sid);
        res.render('otp', { identifier, storedOTP: otp });
      })
      .catch((error) => {
        console.error('Error sending message: ' + error.message);
      });
  }
});

  // ---------------------------VERIFY OTP--------------------------

  // Import necessary modules and setup the app

// Handle the POST request for OTP verification
app.post('/verify-otp', (req, res) => {
  const identifier = req.body.identifier;
  const userOTP = req.body.otp;
  const storedOTP = req.body.storedOTP;
  
  if (otpIsValid(identifier, userOTP)) {
    // OTP verification successful
    res.render('newpass', { identifier }); // Redirect to password reset page
  } else {
    console.log('Invalid OTP or expired. Please try again.');
    res.send('Invalid OTP or expired. Please try again.');
  }
});

// Function to verify OTP

const otpValidityDuration = 2 * 60 * 1000; // 2 minutes in milliseconds
  
function otpIsValid(identifier, userOTP) {
  const storedOTP = otps[identifier];
  if (!storedOTP) {
    console.log('OTP not found');
    return false; // OTP not found
  }

  const currentTime = Date.now();
  const elapsedTime = currentTime - storedOTP.createdAt;

  if (elapsedTime <= otpValidityDuration && storedOTP.otp === userOTP) {
    console.log('OTP is valid');
    delete otps[identifier]; // Remove the used OTP
    return true;
  } else {
    console.log('OTP is invalid or expired');
    return false;
  }
}

// ---------------------------------RESET PASSWORD---------------------------

// Handle the POST request to update the password after OTP verification
app.post('/update-password', (req, res) => {
  const identifier = req.body.identifier;
  const newPassword = req.body.newPassword;
  const confirmPassword = req.body.confirmPassword;

  if (newPassword !== confirmPassword) {
    res.send('New password and confirmation password do not match. Please try again.');
  } else {
    // Implement your logic to update the password for the given identifier
    // For example, you can check whether 'identifier' is an email or phone number
    // Then, update the password in your database

    // After updating the password successfully, you can redirect the user to the login page
    // You should replace the code below with your database update logic
    // Sample code below:

    const isEmail = isValidEmail(identifier);
    const isMobile = isValidMobileNumber(identifier);

    if (isEmail || isMobile) {
      const sql = isEmail
        ? 'UPDATE accounts SET password = ? WHERE email = ?'
        : 'UPDATE accounts SET password = ? WHERE phonenumber = ?';

      const identifierType = isEmail ? 'email' : 'phone number';

      db.query(sql, [newPassword, identifier], (err, result) => {
        if (err) {
          console.log('MySQL query error: ' + err.message);
          res.send(`Failed to update password for ${identifierType}. Please try again.`);
        } else {
          res.send(`Password updated successfully for ${identifierType}.`);
        }
      });
    } else {
      res.send('Invalid input. Please enter either an email or mobile number.');
    }
  }
});


  // Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
