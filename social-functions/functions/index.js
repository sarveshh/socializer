const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = require("express")();

admin.initializeApp();

const config = {
  apiKey: "AIzaSyATk2cuVjoon4P1yHnSC_ctRDZd9QCOCDw",
  authDomain: "react-social-6bfde.firebaseapp.com",
  databaseURL: "https://react-social-6bfde.firebaseio.com",
  projectId: "react-social-6bfde",
  storageBucket: "react-social-6bfde.appspot.com",
  messagingSenderId: "1018209609780",
  appId: "1:1018209609780:web:bac33ccb647ed7cea60261",
  measurementId: "G-0103M2LSFY",
};

const firebase = require("firebase");
firebase.initializeApp(config);

const db = admin.firestore();

app.get("/posts", (req, res) => {
  db.collection("posts")
    .orderBy("createdBy", "desc")
    .get()
    .then((data) => {
      let posts = [];
      data.forEach((doc) => {
        posts.push({
          postId: doc.id,
          body: doc.data().body,
          userHandle: doc.data().userHandle,
          createdAt: doc.data().createdAt,
        });
      });
      return res.json(posts);
    })
    .catch((err) => console.error(err));
});
app.post("/post", (req, res) => {
  const newPost = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    admincreatedAt: new Date().toISOString(),
  };
  db.collection("posts")
    .add(newPost)
    .then((doc) => {
      res.json({ message: `document ${doc.id} created successfully` });
    })
    .catch((err) => {
      res.status(500).json({ error: "Something went wrong" });
      console.error(err);
    });
});

app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };
  let token, userId;
  db.doc(`/users/${newUser.handle}`)
    .get()
    .then((doc) => {
      if (doc.exists) {
        return res.status(400).json({ handle: "this handle is already taken" });
      } else {
        return firebase
          .auth()
          .createUserWithEmailAndPassword(newUser.email, newUser.password);
      }
    })
    .then((data) => {
        userId = data.user.uid;
      return data.user.getIdToken();
    })
    .then((token) => {
        token = token; 
        const useerCredentials = {
            handle:newUser.handle,
            email: newUser.email,
            createdAt: new Date().toISOString(),
            userId
        }
      return db.doc(`/users/${newUser.handle}`).set(useerCredentials);
    })
    .then(() => {
        return res.status(200).json({token});
    })
    .catch(err => {
        console.error(err);
        if(err.code === 'auth/email-already-in-use'){
            return res.status(400).jjson({email: 'email is already in use'})
        }else{
            return res.status(500).json({error: err.code})
        }
    })
});

exports.api = functions.region("asia-south1").https.onRequest(app);
