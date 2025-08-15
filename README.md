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

## Targets

### Professors

- View, Create, Modify Topics OK via /topics
- Assign Topic to Student and possible cancel TODO via POST /theses
- Get theses with filters (supervisor, student, committee member, status) OK via /theses professorId= status= role=
- View thesis details OK via /theses/:id
- View theses state changes (timeline) TODO via /theses/:id/timeline
- View final grade and grade document
- Export CSV/JSON
- View invitations and answer
- TODO: more

### Students

- View topic and thesis status
- Manage profile
-

## API Structure

POST /auth/login
POST /auth/logout
POST /auth/refresh

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
DELETE /invitations/:id
POST /invitations/:id/accept
POST /invitations/:id/decline

GET /topics
POST /topics
GET /topics/:id
PATCH /topics/:id
DELETE /topics/:id
GET /topics/:id/description
PUT /topics/:id/description

GET /theses
POST /theses
GET /theses/:id
PATCH /theses/:id
DELETE /theses/:id
GET /theses/:id/document
PUT /theses/:id/document
GET /theses/:id/notes
POST /theses/:id/notes
GET /theses/:id/resources
POST /theses/:id/resources
GET /theses/:id/presentations
POST /theses/:id/presentations
GET /theses/:id/invitations
POST /theses/:id/invitations

TODO

GET /professors
GET /students
GET /secretaries

GET /professors/:id/topics
POST /professors/:id/topics
GET /professors/:id/theses
