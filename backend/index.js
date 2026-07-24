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

const VALID_STATUSES = ["upnext", "inprogress", "done"];

function getOrgForBoard(boardId) {
    const board = BOARDS.find(b => b.id === boardId);
    if (!board) return null;

    return ORGANIZATIONS.find(org => org.id === board.organizationId) || null;
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

// List all orgs the logged-in user belongs to (admin or member) — powers the "change org" dropdown

app.get("/organizations", authMiddleware, (req, res) => {
    const userId = req.userId;
    const myOrgs = ORGANIZATIONS.filter(org => isPartOfOrg(userId, org));
    const summarized = myOrgs.map(org => ({
        id: org.id,
        title: org.title,
        description: org.description,
        isAdmin: org.admin === userId
    }))
    res.json({
        organizations: summarized
    })
})

// Full details of ONE org — admin only, since it exposes the full member list
app.get("/organization", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = Number(req.query.organizationId);

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!organization) {
        return res.status(411).json({
            message: "Org doesn't exist"
        });
    }

    if (organization.admin !== userId) {
        return res.status(403).json({
            message: "Only the admin of this org can view its full details"
        });
    }


    const memberUsers = organization.members.map(id => {
        const u = USERS.find(u => u.id === id);
        return u ? { id: u.id, username: u.username } : null;
    }).filter(Boolean);

    const adminUser = USERS.find(u => u.id === organization.admin);

    res.json({
        id: organization.id,
        title: organization.title,
        description: organization.description,
        admin: adminUser ? { id: adminUser.id, username: adminUser.username } : null,
        members: memberUsers
    });
});

// List members of an org — any member (or admin) can view, not just admin
app.get("/members", authMiddleware, (req, res) => {
    const userId = req.userId;
    const organizationId = Number(req.query.organizationId);

    const organization = ORGANIZATIONS.find(org => org.id === organizationId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            message: "Either this org doesn't exist or you are not part of it"
        });
    }

    const memberUsers = organization.members.map(id => {
        const u = USERS.find(u => u.id === id);
        return u ? { id: u.id, username: u.username } : null;
    }).filter(Boolean);

    res.json({
        members: memberUsers
    });
});


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
        id: BOARD_ID++,
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

    const userId = req.userId;
    const boardId = req.body.boardId;
    const title = req.body.title;
    const description = req.body.description;

    const organization = getOrgForBoard(boardId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            message: "Either this board doesnot exist or you donot have access to it"
        })
    }

    const issue = {
        id: ISSUES_ID++,
        title,
        description,
        boardId,
        status: "upnext",
        createdBy: userId
    }
    ISSUES.push(issue);
    res.json({
        message: "Issue created",
        id: issue.id
    })
})

app.get("/issues", authMiddleware, (req, res) => {
    const userId = req.userId;
    const boardId = Number(req.query.boardId);

    const organization = getOrgForBoard(boardId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            message: "Either this board doesn't exist or you don't have access to it"
        });
    }

    const issues = ISSUES.filter(i => i.boardId === boardId);

    res.json({
        issues
    });
});

app.put("/issues", authMiddleware, (req, res) => {
    const userId = req.userId;
    const issueId = req.body.issueId;
    const newStatus = req.body.status;

    const issue = ISSUES.find(i => i.id === issueId);

    if (!issue) {
        return res.status(411).json({
            message: "Issue not found"
        })
    }
    const organization = getOrgForBoard(issue.boardId);

    if (!isPartOfOrg(userId, organization)) {
        return res.status(411).json({
            message: "You donot have access to this issue"
        })
    }
    if (!VALID_STATUSES.includes(newStatus)) {
        return res.status(400).json({
            message: "status must be one of : " + VALID_STATUSES.join(", ")
        })
    }
    issue.status = newStatus;

    res.json({
        message: "Issue updated",
        issue
    })

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