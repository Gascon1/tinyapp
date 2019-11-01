const bcrypt = require('bcryptjs');
const { users, urlDatabase } = require('./database');

/**
 * Check if the userID of the user matches the userID
 * of the short URL being targeted by an edit or delete.
 */
const authenticateDeleteEdit = (userID) => {
  for (let shortURL in urlDatabase) {
    if (userID === urlDatabase[shortURL].userID) {
      return true;
    }
  }
  return false;
};

/**
 * takes the userDatabase and checks if the email
 * is valid and part of the database
 */
const checkUserEmail = (usersDatabase, formEmail) => {
  for (const userId in usersDatabase) {
    let email = users[userId].email;
    if (email === formEmail) {
      return true;
    }
  }
  return false;
};

/** 
 * check is the password the user enters is the password 
 * of his account and if it is in the database. 
*/
const checkUserPassword = (usersDatabase, formPassword) => {
  for (const userId in usersDatabase) {
    let password = users[userId].password;
    if (bcrypt.compareSync(formPassword, password)) {
      return true;
    }
  }
  return false;
};

/**
 * check if the urls belong to the user 
 * based on his ID
 */
const urlsForUser = (id) => {
  let urlsForUserObj = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsForUserObj[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsForUserObj;
};


/**
 * generate a random string of 6 alpha-numeric characters
 * that will be used to assign the short URL to the long URL
 * or the userID
 */
const generateRandomString = () => {
  return Math.random(36).toString(36).slice(2, 8);
};


module.exports = { authenticateDeleteEdit, checkUserEmail, checkUserPassword, urlsForUser, generateRandomString, users, urlDatabase };