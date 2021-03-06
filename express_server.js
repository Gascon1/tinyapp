const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { authenticateDeleteEdit, checkUserEmail, checkUserPassword, urlsForUser, generateRandomString } = require('./helpers');
const { users, urlDatabase } = require('./database');


app.use(
  cookieSession({
    name: 'session',
    keys: [
      '7de13381-61b5-47aa-9c74-5ede1ceac390',
      '8dddb6db-4d8d-4571-a836-04fa8d5a9186',
    ],
  }),
);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set("view engine", "ejs");


app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = {
      user: users[req.session.user_id]
    };
    res.render("urls_new", templateVars);
  }
});

app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlsForUser(req.session.user_id),
    user: users[req.session.user_id],
  };
  res.render('urls_index', templateVars);
});

app.get('/', (req, res) => {
  res.redirect('/urls');
});

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  res.render('login', templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
    res.render("urls_show", templateVars);
  }
});

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body['longURL'], userID: req.session.user_id };
  res.redirect(`/urls`);
});

/**
 * this post deletes a short URL from the user's account. Only the logged in user 
 * can delete his own short URLs.
*/
app.post('/urls/:shortURL/delete', (req, res) => {
  if (authenticateDeleteEdit(req.session.user_id)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

/**
 * this post updates a short URL from the user's account. Only the logged in user 
 * can update his own short URLs.
*/
app.post('/urls/:shortURL/update', (req, res) => {
  if (authenticateDeleteEdit(req.session.user_id)) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

/**
 * When a user attempts to log in, I first check if the fields are empty.
 * Then, i check if the email is in the database. Then, I check if the password
 * is valid. If all of those check out, the user is then looged in and redirected 
 * to /urls.
*/
app.post('/login', (req, res) => {
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send(`${res.statusCode} Please enter a valid email or password`);
  } else if (!checkUserEmail(users, req.body.email)) {
    res.status(403);
    res.send(`${res.statusCode} Cannot find email address`);
  } else if (!checkUserPassword(users, req.body.password)) {
    res.status(403);
    res.send(`${res.statusCode} Password does not match`);
  } else {
    for (const userId in users) {
      let email = users[userId].email;
      if (email === req.body.email) {
        user_id = users[userId].id;
      }
    }
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

/**
 * When a user registers, a randomly generated user_id is assigned to him.
 * Much like the login, I first check if one of the registration fields
 * are empty. Then, I check if the user already has an account. If both of 
 * these check out, the user is registered, logged in, and is redirected to /urls
*/
app.post('/register', (req, res) => {
  let user_id = generateRandomString();
  if (req.body.email === '' || req.body.password === '' || req.body.name === '') {
    res.status(400);
    res.send(`${res.statusCode} Please make sure you enter a name, email and password`);
  } else if (checkUserEmail(users, req.body.email)) {
    res.status(400);
    res.send(`${res.statusCode} Seems like you already have an account, please login!`);
  } else {
    users[user_id] = {
      id: user_id,
      name: req.body.name,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, salt)
    };
    req.session.user_id = user_id;
    res.redirect('/urls');
  }
});

app.post('/logout', (req, res) => {
  req.session.sig = null;
  req.session = null;
  res.redirect('/urls');
});

app.listen(PORT, () => {
});