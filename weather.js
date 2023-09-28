var express = require('express');
var app = express();
const bcrypt = require('bcryptjs');
app.use(express.static('public'));
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Filter } = require('firebase-admin/firestore');
var serviceAccount = require("./log.json");
initializeApp({
    credential: cert(serviceAccount)
});
const db = getFirestore();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true })); 
app.get('/signup', function (req, res) {
    res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get('/login', function (req, res) {
    res.sendFile(__dirname + "/public/" + "signup.html");
});

app.get('/loginup', function (req, res) {
    res.sendFile(__dirname + "/public/" + "weather.html");
});
app.post('/signup', function (req, res) {
    const { Email, FullName, Password } = req.body;
    bcrypt.hash(Password, 10, (err, hashedPassword) => {
        if (err) {
            console.error(err);
            res.send("Error hashing the password");
            return;
        }

        db.collection('userDemo')
            .where(
                Filter.or(
                    Filter.where("Email", "==", Email),
                    Filter.where("userName", "==", FullName)
                )
            )
            .get()
            .then((docs) => {
                if (docs.size > 0) {
                    res.send("Hey, this is an existing account");
                } else {
                    db.collection("userDemo")
                        .add({
                            userName: FullName,
                            Email: Email,
                            Password: hashedPassword,
                        })
                        .then(() => {
                            res.sendFile(__dirname + "/public/"+"login.html");
                        })
                        .catch(() => {
                            res.send("Something went wrong");
                        });
                }
            });
    });
});
app.post("/loginup", function (req, res) {
    const { Email, Password } = req.body;
    db.collection('userDemo')
        .where("Email", "==", Email)
        .get()
        .then((docs) => {
            if (docs.size > 0) {
                const user = docs.docs[0].data();
                const hashedPassword = user.Password;
                bcrypt.compare(Password, hashedPassword, (err, result) => {
                    if (err || !result) {
                        res.send("Authentication failed");
                    } else {
                        res.send("Authentication successful");
                    }
                });
            } else {
                res.send("User not found");
            }
        });
});

app.get("/login", function (req, res) {
    res.sendFile(__dirname + "/public/" + "login.html");
});

app.listen(3000);
