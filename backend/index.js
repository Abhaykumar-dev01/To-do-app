const express = require("express");
const app = express();
const user = [];
const organizatios = [];
const boards = [];
const issues = [];

app.get("/", (req, res) => {
    res.send("hii")
})



app.listen(3000, () => {

    console.log("listening on port 3000")
})