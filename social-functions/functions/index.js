const functions = require("firebase-functions");
const app = require("express")();
const {getAllPosts, postOnePost} = require('../functions/handlers/posts');
const { signup, login} = require('./handlers/users')
const FBAuth = require('./util/fbAuth')

app.get("/posts", getAllPosts);
app.post("/post",FBAuth, postOnePost);
app.post("/signup", signup);
app.post("/login", login);

exports.api = functions.region("asia-south1").https.onRequest(app);
