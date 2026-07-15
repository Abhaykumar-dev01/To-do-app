const express = require("express");
const app = express();


let USERS_ID = 1;
let ORGANIZATION_ID = 1;
let BOARD_ID = 1;
let ISSUES_ID = 1;


const USERS = [];
const ORGANIZATIONS = [];
const BOARDS = [];
const ISSUES = [];

app.use(express.json());

app.get("/", (req, res) => {
    res.send("hii")
})
app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const userExists = USERS.find(u => u.username === username);
    if (userExists) {
        res.status(411).json({
            message: "user with this usrname already exists"

        })
        return;
    }

    USERS.push({
        username,
        password,
        id: USERS_ID++
    })
    res.json({
        message: "You have signed up successfully"
    })
})
app.post("/signin", (req, res) => {

    const username = req.body.username;
    const password = req.body.password;

    const userExists = USERS.find(u => u.username === username && u.password === password);
    if (!userExists) {
        res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const token = jwt.sign({
        userId: userExists.id
    }, "abhay123123key");


    res.json({
        token
    })

})
app.post("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    ORGANIZATIONS.push({
        id: ORGANIZATION_ID++,
        title: req.body.title,
        description: req.body.description,
        admin: userId,
        members: []
    })

    res.json({
        message: "Org created",
        id: ORGANIZATION_ID - 1
    })
})


app.post("/add-member-to-organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUserUsername = req.body.memberUserUsername;

    const organization = ORGANIZATIONS.find(org => org.id === organisationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnot exist or you are not an admin of this org"
        })
        return;
    }

    const memberUser = USERS.find(u => u.username === memberUserUsername);

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exist in our db"
        })
        return
    }
    organisation.members.push(memberUser.id);

    res.json({
        message: " new member added"
    })

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