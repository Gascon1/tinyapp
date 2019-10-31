const bcrypt = require('bcryptjs');
const { users, urlDatabase } = require('./database');


const authenticateDeleteEdit = (userID) => {
  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      return true;
    }
  }
  return false;
};

const checkUserEmail = (usersDatabase, formEmail) => {
  for (const userId in usersDatabase) {
    let email = users[userId].email;
    if (email === formEmail) {
      return true;
    }
  }
  return false;
};

const checkUserPassword = (usersDatabase, formPassword) => {
  for (const userId in usersDatabase) {
    let password = users[userId].password;
    if (bcrypt.compareSync(formPassword, password)) {
      return true;
    }
  }
  return false;
};

const urlsForUser = (id) => {
  let urlsForUserObj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsForUserObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsForUserObj;
};

const generateRandomString = () => {
  return Math.random(36).toString(36).slice(2, 8);
};


module.exports = { authenticateDeleteEdit, checkUserEmail, checkUserPassword, urlsForUser, generateRandomString, users, urlDatabase };