const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3500;

app.use(cors());
app.use(bodyParser.json());

// In-memory user data for testing (replace with a database in a real app)
const signInUsers = [
  { user: 'testuser', pwd: 'testpassword' }
];

const registerUsers = [];

const passwordResetTokens = {};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your_email@gmail.com',
    pass: 'your_email_password',
  },
});

app.post('/signin', (req, res) => {
  const { user, pwd } = req.body;

  try {
    const foundUser = signInUsers.find(u => u.user === user && u.pwd === pwd);

    if (foundUser) {
      res.status(200).json({ success: true });
    } else {
      res.status(401).json({ error: 'Invalid Username or Password' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/register', (req, res) => {
  const { user, pwd } = req.body;

  console.log('Request received:', req.body);

  try {
    if (userExists(user)) {
      console.log('Username already taken');
      return res.status(409).json({ error: 'Username already taken' });
    }

    saveUser({ user, pwd });

    console.log('Registration successful');
    res.status(201).json({ success: true });
  } catch (err) {
    handleRegistrationError(err, res);
  }
});

app.post('/forget-password', (req, res) => {
  const { username } = req.body;
  const user = registerUsers.find(u => u.username === username);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  passwordResetTokens[token] = { username, email: user.email };

  sendPasswordResetEmail(user, token);

  res.status(200).json({ success: true });
});

app.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const resetData = passwordResetTokens[token];

  if (!resetData) {
    return res.status(404).json({ error: 'Invalid or expired token' });
  }

  updateUserPassword(resetData.username, password);

  delete passwordResetTokens[token];

  res.status(200).json({ success: true });
});

function userExists(username) {
  return registerUsers.some(u => u.username === username);
}

function saveUser(userData) {
  registerUsers.push(userData);
}

function handleRegistrationError(err, res) {
  console.error(err);

  if (!err?.response) {
    console.log('Internal Server Error');
    res.status(500).json({ error: 'Internal Server Error' });
  } else if (err.response?.status === 409) {
    console.log('Username Taken');
    res.status(409).json({ error: 'Username Taken' });
  } else {
    console.log('Registration Failed');
    res.status(500).json({ error: 'Registration Failed' });
  }
}

function sendPasswordResetEmail(user, token) {
  const resetLink = `http://localhost:${PORT}/reset-password/${token}`;
  const mailOptions = {
    from: 'your_email@gmail.com',
    to: user.email,
    subject: 'Password Reset',
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      console.error(error);
    }
  });
}

function updateUserPassword(username, newPassword) {
  // Update the user's password in your database (this is just a placeholder)
  const userIndex = registerUsers.findIndex(u => u.username === username);
  registerUsers[userIndex].password = newPassword;
}

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
