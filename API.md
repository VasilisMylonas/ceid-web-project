# API

## Auth

### POST /auth/login

- body: { username, password }

### POST /auth/logout

## Users

### GET /users

- query: { filter, limit, offset, sort_by }

### GET /users/:id

### PATCH /users/:id

- body: { name?, email?, password? }

### DELETE /users/:id

## Thesis Topics

### GET /topics

- query: { filter, limit, offset, sort_by }

### GET /topics/:id

### POST /topics

TODO

### PATCH /topics/:id

- body: { title?, summary? }

### DELETE /topics/:id

### POST /topics/:id/upload

Upload file

## Theses

### GET /theses

- filter
- limit
- offset
- sort_by

### GET /theses/:id

### POST /theses

- body: { studentId, topicId }

### PATCH /theses/:id

TODO

### DELETE /theses/:id

### GET /theses/:id/invitations

## Committee Invitations

### GET /committee-invitations

- filter
- limit
- offset
- sort_by

### GET /committee-invitations/:id

Get committee invitation info

### POST /committee-invitations/:id/accept

Accept committee invitation

### POST /committee-invitations/:id/reject

Reject committee invitation
