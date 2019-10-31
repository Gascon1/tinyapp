const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const salt = bcrypt.genSaltSync(10);
const { authenticateDeleteEdit, checkUserEmail, checkUserPassword, urlsForUser, generateRandomString, users, urlDatabase } = require('./helpers')

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
app.set("view engine", "ejs");

// const users = {
//   "userRandomID": {
//     id: "userRandomID",
//     email: "user@example.com",
//     password: "purple-monkey-dinosaur"
//   },
//   "aJ48lW": {
//     id: "aJ48lW",
//     email: "user2@example.com",
//     password: "dishwasher-funk"
//   }
// };

// const urlDatabase = {
//   i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
//   b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
//   b6UvpO: { longURL: "https://www.ign.ca", userID: "vR51aF" }
// };


// const authenticateDeleteEdit = (userID) => {
//   for (let shortURL in urlDatabase) {
//     if (userID === urlDatabase[shortURL].userID) {
//       return true;
//     }
//   }
//   return false;
// };

// const checkUserEmail = (usersDatabase, formEmail) => {
//   for (const userId in usersDatabase) {
//     let email = users[userId].email;
//     if (email === formEmail) {
//       return true;
//     }
//   }
//   return false;
// };

// const checkUserPassword = (usersDatabase, formPassword) => {
//   for (const userId in usersDatabase) {
//     let password = users[userId].password;
//     if (bcrypt.compareSync(formPassword, password)) {
//       return true;
//     }
//   }
//   return false;
// };

// const urlsForUser = (id) => {
//   let urlsForUserObj = {};
//   for (let shortURL in urlDatabase) {
//     if (urlDatabase[shortURL].userID === id) {
//       urlsForUserObj[shortURL] = urlDatabase[shortURL];
//     }
//   }
//   return urlsForUserObj;
// };

// const generateRandomString = () => {
//   return Math.random(36).toString(36).slice(2, 8);
// };


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
    user: users[req.session.user_id]
  };
  res.render('urls_index', templateVars);
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.session.user_id] };
  res.render("urls_show", templateVars);
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

app.post('/urls/:shortURL/delete', (req, res) => {
  if (authenticateDeleteEdit(req.session.user_id)) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.post('/urls/:shortURL/update', (req, res) => {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

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

app.post('/logout', (req, res) => {
  req.session.sig = null;
  req.session = null;
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  //refactor : make this in another function
  let user_id = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send(`${res.statusCode} Please enter a valid email or password`);
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

app.listen(PORT, () => {
});