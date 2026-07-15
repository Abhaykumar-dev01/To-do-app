const express = require("express");
const app = express();
const user = [];
const organizatios = [];
const boards = [];
const issues = [];

app.get("/", (req, res) => {
    res.send("hii")
})
app.post("/signup", (req, res) => {

})
app.post("/signin", (req, res) => {

})
app.post("/organization", (req, res) => {

})
app.post("/add-memeber-to-organization", (req, res) => {

})

app.post("/board", (req, res) => {

})
app.post("/issue", (req, res) => {

})

app.get("/boards", (req, res) => {

})
app.get("/issues", (req, res) => {

})
app.get("/members", (req, res) => {

})

app.put("/issues", (req, res) => {

})

app.listen(3000, () => {

    console.log("listening on port 3000")
})