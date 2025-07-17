# API

## Auth

### POST /auth/login

### POST /auth/logout

## Users

### GET /users

### GET /users/:id

### PATCH /users/:id

### DELETE /users/:id

## Thesis topics

### GET /topics

- query: { filter, limit, offset, sort_by }

### GET /topics/:id

### POST /topics

### PATCH /topics/:id

### DELETE /topics/:id

### POST /topics/:id/upload

## Theses

### GET /theses

### GET /theses/:id

### POST /theses

### PATCH /theses/:id

### DELETE /theses/:id

### GET /theses/:id/invitations

### GET /theses/:id/committee

### GET /theses/:id/timeline

### GET /theses/:id/notes

### POST /theses/:id/notes

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
