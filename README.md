# CEID Web Project

## Getting Started

### Prerequisites

- node.js
- npm
- Docker or Podman

### Installation

1. Clone the repository:

```bash
   git clone https://github.com/yourusername/ceid-web-project.git
   cd ceid-web-project
```

2. Install dependencies:

```bash
   npm install
```

### Running the Application

To start the development server:

```bash
docker compose up
```

or

```bash
podman compose up
```

The application should now be running at `http://localhost:3000` (or another port if specified).

## Project Structure

```text
ceid-web-project/
|-- public/ # Static assets (frontend)
|-- src/ # Source code (backend)
|   |-- config/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|-- tests/
```

## API Structure

- POST /auth/login
   Authenticate user and return JWT token
- POST /auth/logout (TODO)
   Invalidate the current JWT token NOT IMPLEMENTED - NOT REQUIRED BY THE ASSIGNMENT, just delete it client-side
- POST /auth/refresh (TODO)
   Refresh authentication token NOT IMPLEMENTED - NOT REQUIRED BY THE ASSIGNMENT
- POST /topics (TODO)
   Create a new topic
- GET /topics/:id/description (TODO)
   Get topic description
- PUT /topics/:id/description (TODO)
   Update topic description
- GET /my/topics
   Get topics created by the authenticated professor
- PUT /topics/:id
   Update topic details
- POST /theses
   Create a new thesis (assign topic to a student)
- GET /students
   Query students
- GET /my/theses
   Get theses in which the authenticated professor partakes
- GET /theses/:id (TODO)
   Get thesis details
- GET /my/theses/export (TODO)
   Get theses of the authenticated student
- GET /my/invitations
   Get pending invitations received by the authenticated professor
- PATCH /invitations/:id/response
   Accept or decline an invitation
- DELETE /invitations/:id
   Delete an invitation (invitation was sent by mistake)
- GET /theses/:id/invitations
   Get invitations related to a thesis
- DELETE /theses/:id
   Delete a thesis (unassign topic from student)
- POST /theses/:id/notes
   Add a note to a thesis
- GET /theses/:id/notes
   Get current professor thesis notes
- POST /theses/:id/cancel
   Professor cancels the thesis

GET /topics (TODO/NOT REQUIRED)
GET /topics/:id (TODO/ NOT REQUIRED)
PUT /topics/:id
DELETE /topics/:id
POST /theses/:id/invitations


GET /users
POST /users

GET /users/:id
PATCH /users/:id
DELETE /users/:id

GET /notes/:id
PATCH /notes/:id
DELETE /notes/:id

GET /resources/:id
PATCH /resources/:id
DELETE /resources/:id

GET /presentations/:id
PATCH /presentations/:id
DELETE /presentations/:id

GET /invitations/:id
PATCH /invitations/:id
POST /invitations/:id/accept
POST /invitations/:id/decline


GET /theses
POST /theses
GET /theses/:id
PATCH /theses/:id
DELETE /theses/:id
GET /theses/:id/document
PUT /theses/:id/document
GET /theses/:id/notes
GET /theses/:id/resources
POST /theses/:id/resources
GET /theses/:id/presentations
POST /theses/:id/presentations

POST /theses/:id/invitations
