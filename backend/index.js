const express = require("express");
const jwt = require("jsonwebtoken");
const path = require("path");
const { authMiddleware, JWT_SECRET } = require("./middleware");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")))

let USERS_ID = 1;
let ORGANIZATION_ID = 1;
let BOARD_ID = 1;
let ISSUES_ID = 1;


const USERS = [];
const ORGANIZATIONS = [];
const BOARDS = [];
const ISSUES = [];

//Returns true if userId is the admin OR a member of this organisation 
function isPartOfOrg(userId, organization) {
    if (!organization) {
        return false;
    }

    return organization.admin === userId || organization.members.includes(userId);
}


//AUTH


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
        return res.status(403).json({
            message: "Incorrect credentials"
        })
    }

    const token = jwt.sign({
        userId: userExists.id
    }, JWT_SECRET);


    res.json({
        token
    })

})

//Organizations

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
    organization.members.push(memberUser.id);

    res.json({
        message: " new member added"
    })

})

app.post("/board", authMiddleware, (req, res) => {

    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const title = req.body.title;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            "message": "Either this org doesnot exist or you are not part of it"
        })
    }
    const board = {
        id: Board_ID++,
        title,
        organizationId,
        createdBy: userId
    }
    BOARDS.push(board);

    res.json({
        message: "Board created",
        id: board.id
    });
});



app.get("/boards", (req, res) => {
    const userId = req.userId;
    const organizationId = Number(req.query.organizationId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            message: "Either this org doesnort exist or you are not part of it"

        })
    }
    const boards = BOARDS.filter(b => b.organizationId === organizationId)
    res.json({
        boards
    })
})

app.post("/issue", (req, res) => {

})

app.get("/issues", (req, res) => {

})
app.get("/members", (req, res) => {

})

app.put("/issues", (req, res) => {

})

app.delete("/members", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = req.body.organizationId;
    const memberUserUsername = req.body.memberUserUsername;

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization || organization.admin !== userId) {
        res.status(411).json({
            message: "Either this org doesnt exist or you are not an admin of this org"
        })
        return
    }

    const memberUser = USERS.find(u => u.username === memberUserUsername);

    if (!memberUser) {
        res.status(411).json({
            message: "No user with this username exists in our db"
        })
        return
    }
    organization.members = organization.members.filter(id => id !== memberUser.id);
    res.json({
        message: "memeber deleted"
    })
})

app.listen(3000, () => {

    console.log("listening on port 3000")
})