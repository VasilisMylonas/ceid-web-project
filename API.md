/_
GET /api/topics (view all topics)
POST /api/topics (create topic)
GET /api/topics/:id (view topic)
PUT /api/topics/:id (update topic)
DELETE /api/topics/:id (delete topic)
_/

/\*

2. Topic assignment to student
   POST /api/topics/:id/assign (assign topic to student)
   POST /api/topics/:id/unassign (unassign topic from student)
   POST /api/topics/:id/finalize (finalize topic)

3. Theses management
   GET /api/theses (view all thesis)
   GET /api/theses/:id (view thesis)
   POST /api/theses (create thesis)
   PUT /api/theses/:id (update thesis)
   POST /api/theses/:id/notes (add notes)
   GET /api/theses/:id/notes (view notes)
   POST /api/theses/:id/submit (submit thesis)
   POST /api/theses/:id/cancel (cancel thesis)
   POST /api/theses/:id/approve (approve thesis)
   POST /api/theses/:id/reject (reject thesis)

4. GET /api/invitations (view all invitations)
   POST /api/invitations/:id/accept (accept invitation)
   POST /api/invitations/:id/reject (reject invitation)

5. GET /api/statistics (view statistics)

\*/
