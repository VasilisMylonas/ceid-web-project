const express = require('express'); // Express framework
const jwt = require('jsonwebtoken'); // JSON Web Token (for authentication)
const bcrypt = require('bcrypt'); // Password hashing
const { StatusCodes } = require('http-status-codes'); // Standard HTTP status codes
const db = require('./db'); // Database connection and models

const port = 3000;
const jwt_secret = 'your_jwt_secret'; // TODO
const app = express();
app.use(express.json());

db.setup();

function authenticate(req, res, next) {
    const authHeader = req.headers['authorization']; // The header is "Authorization: Bearer <token>"
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(StatusCodes.UNAUTHORIZED);
    }

    try {
        req.auth = jwt.verify(token, jwt_secret); // Verify the token
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(StatusCodes.FORBIDDEN);
    }
};

app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(StatusCodes.BAD_REQUEST).send('Username or password not provided');
    }

    try {
        const user = await db.UserModel.findOne({ where: { "username": username } });

        if (!user) {
            return res.status(StatusCodes.UNAUTHORIZED).send();
        }

        // TODO
        // const isPasswordValid = await bcrypt.compare(password, user.password);
        const isPasswordValid = password === user.password; // For testing purposes, use plain text password

        if (!isPasswordValid) {
            return res.status(StatusCodes.UNAUTHORIZED).send();
        }

        const token = jwt.sign({ id: user.id }, jwt_secret, { expiresIn: '1h' });

        res.status(StatusCodes.OK).json({ token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
    }
});

app.get("/api/user", authenticate, async (req, res) => {
    console.log(req.auth);
    res.status(StatusCodes.OK).json({ auth: req.auth });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});






/*

1) Topic Management
GET /api/topics (view all topics)
POST /api/topics (create topic)
GET /api/topics/:id (view topic)
PUT /api/topics/:id (update topic)
DELETE /api/topics/:id (delete topic)

2) Topic assignment to student
POST /api/topics/:id/assign (assign topic to student)
POST /api/topics/:id/unassign (unassign topic from student)
POST /api/topics/:id/finalize (finalize topic)

3) Theses management
GET /api/theses (view all thesis)
GET /api/theses/:id  (view thesis)
POST /api/theses (create thesis)
PUT /api/theses/:id (update thesis)
POST /api/theses/:id/notes (add notes)
GET /api/theses/:id/notes (view notes)
POST /api/theses/:id/submit (submit thesis)
POST /api/theses/:id/cancel (cancel thesis)
POST /api/theses/:id/approve (approve thesis)
POST /api/theses/:id/reject (reject thesis)

4)
GET /api/invitations (view all invitations)
POST /api/invitations/:id/accept (accept invitation)
POST /api/invitations/:id/reject (reject invitation)

5)
GET /api/statistics (view statistics)

*/
