# Simple-OTP-System
A streamlined OTP system for password recovery, designed to send a time-sensitive OTP to your email or mobile. If not used within a set timeframe, the OTP expires, ensuring enhanced security for when you need to reset your forgotten passwords.

# Application Setup and Run Guide

This guide provides step-by-step instructions on how to set up and run the provided Node.js application, which uses Express, MySQL, and other packages to create a basic user authentication system.

## Prerequisites

Before you begin, ensure you have the following installed on your system:

- Node.js and npm (Node Package Manager)
- MySQL Server or XAMPP

## Setup Instructions

### 1. Clone the Repository (Optional)

If the code is hosted on GitHub, clone the repository to your local machine. If you've received the code via other means, skip this step.

```bash
git clone <https://github.com/Gurupatel007/Simple-OTP-System.git>
```

### 2. Install Dependencies

Navigate to the project directory and install the required npm packages:

```bash
npm install
```

### 3. Database Configuration

- Start your MySQL server.
- Log in to your MySQL console and create a new database for the project:

```sql
CREATE DATABASE createaccount;
```

- In the same MySQL console or using a database management tool like phpMyAdmin, run the following SQL command to create the `accounts` table:

```sql
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phonenumber VARCHAR(15) NOT NULL,
  dob DATE NOT NULL,
  gender ENUM('male', 'female', 'other') NOT NULL,
  password VARCHAR(255) NOT NULL
);
```

- Update the database connection details in the project code. Locate the following section in the provided code:

```javascript
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'createaccount',
  port: '3307', // Change the port as needed
});
```

Make sure to replace the `host`, `user`, `password`, and `port` values with your actual MySQL server details.

### 4. Configuration for Nodemailer and Twilio

- For Nodemailer, update the transporter configuration with your actual email service provider details and credentials:

```javascript
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_password',
  },
  secure: true,
});
```

- For Twilio (used to send SMS OTP), update the following details with your Twilio account information:

```javascript
const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const client = new twilio(accountSid, authToken);
```

Replace `your_account_sid` and `your_auth_token` with your actual Twilio Account SID and Auth Token.

### 5. Running the Application

Once the setup is complete, start the application server using the following command:

```bash
npm start
or
node app.js
```

Or, if you're using `nodemon` for development:

```bash
nodemon
```

The application will start running on `http://localhost:3000`. Open a web browser and navigate to this URL to interact with the application.

## Features

- **Flexible Authentication:** Users can log in using either their email or phone number.
- **Secure OTP:** OTPs expire after a set duration, enhancing security.
- **Email & SMS Support:** Supports sending OTPs via both email and SMS (through Twilio for SMS).

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- Node.js
- MySQL
- Express
- EJS
- Nodemailer
- Twilio