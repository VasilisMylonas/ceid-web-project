document.addEventListener('DOMContentLoaded', async () => {
  // === ΚΕΝΗ ΤΟΠΙΚΗ ΚΑΤΑΣΤΑΣΗ (γεμίζει από τα δικά σας APIs) ===
  const state = {
    currentProfessor: { id: null, name: '' }, // TODO: set from auth/session if needed
    topics: [],        // γεμίζει από getMyUnassignedTopics() ή/και getTopics()
    lecturers: [],     // γεμίζει από getLecturers()
    theses: [],        // γεμίζει από getTheses()
    students: [],      // γεμίζει από getStudents()
    studentsLoaded: false,
  };

  // --- Επιλογείς στοιχείων UI ---
  const myTopicsTableBody = document.getElementById('my-topics-table-body');

  // Bootstrap modals
  const bs = window.bootstrap;
  const assignStudentModalEl = document.getElementById('assign-student-modal');
  const assignStudentModal = bs ? new bs.Modal(assignStudentModalEl) : null;
  const assignStudentForm = document.getElementById('assign-student-form');
  const assignTopicIdInput = document.getElementById('assign-topic-id');
  const assignTopicTitle = document.getElementById('assign-topic-title');
  const studentSearchInput = document.getElementById('studentSearch');

  const confirmUnassignModalEl = document.getElementById('confirm-unassign-modal');
  const confirmUnassignModal = bs ? new bs.Modal(confirmUnassignModalEl) : null;
  const confirmUnassignBtn = document.getElementById('confirm-unassign-btn');
  const confirmUnassignTitle = document.getElementById('confirm-unassign-title');
  const confirmUnassignModalLabel = document.getElementById('confirmUnassignModalLabel');

  // === Δυναμική δημιουργία Invitations Modal (αν δεν υπάρχει) ===
  let invitationsModalEl = document.getElementById('invitations-modal');
  if (!invitationsModalEl) {
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="invitations-modal" tabindex="-1" aria-labelledby="invitations-modal-label" aria-hidden="true">
        <div class="modal-dialog modal-lg modal-dialog-scrollable">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="invitations-modal-label">Προσκεκλημένα Μέλη</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Κλείσιμο"></button>
            </div>
            <div class="modal-body">
              <div class="mb-2">
                <strong id="invitations-topic-title"></strong>
                <div class="text-muted small" id="invitations-student-line"></div>
              </div>
              <div class="table-responsive">
                <table class="table table-sm align-middle">
                  <thead>
                    <tr>
                      <th>Διδάσκων</th>
                      <th>Κατάσταση</th>
                      <th>Ημ/νία Πρόσκλησης</th>
                      <th>Ημ/νία Αποδοχής</th>
                      <th>Ημ/νία Απόρριψης</th>
                    </tr>
                  </thead>
                  <tbody id="invitations-table-body">
                    <tr><td colspan="5" class="text-muted">Δεν υπάρχουν προσκεκλημένα μέλη.</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="modal-footer">
              <!-- Finalize button gets injected dynamically just below -->
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Κλείσιμο</button>
            </div>
          </div>
        </div>
      </div>
    `);
    invitationsModalEl = document.getElementById('invitations-modal');
  }
  const invitationsModal = bs ? new bs.Modal(invitationsModalEl) : null;
  const invitationsTopicTitle = document.getElementById('invitations-topic-title');
  const invitationsStudentLine = document.getElementById('invitations-student-line');
  const invitationsTableBody = document.getElementById('invitations-table-body');

  // --- Add Finalize button inside modal footer (if missing) ---
  const invitationsFooter = invitationsModalEl.querySelector('.modal-footer');
  let invitationsFinalizeBtn = document.getElementById('invitations-finalize-btn');
  if (!invitationsFinalizeBtn) {
    invitationsFooter.insertAdjacentHTML(
      'afterbegin',
      `<button type="button" class="btn btn-success me-auto" id="invitations-finalize-btn" title="Οριστικοποίηση">
         <i class="bi bi-check2-circle"></i> Οριστικοποίηση
       </button>`
    );
    invitationsFinalizeBtn = document.getElementById('invitations-finalize-btn');
  }

  // Container δυναμικών αποτελεσμάτων αναζήτησης
  let studentResults = document.getElementById('studentResults');
  if (!studentResults) {
    studentResults = document.createElement('div');
    studentResults.id = 'studentResults';
    studentResults.className = 'list-group mt-2';
    studentSearchInput?.insertAdjacentElement('afterend', studentResults);
  }

  // --- Κατάσταση επιλογής φοιτητή ---
  let selectedStudent = null;
  let submittingAssign = false;

  // === Βοηθητικά ===
  const escapeHTML = (str) => {
    if (str == null) return '';
    return String(str)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('el-GR') : '-';

  const statusBadge = (status) => {
    switch (status) {
      case 'Ελεύθερο': return `<span class="badge bg-success">Ελεύθερο</span>`;
      case 'Υπό Ανάθεση': return `<span class="badge bg-warning text-dark">Υπό Ανάθεση</span>`;
      case 'Ενεργή': return `<span class="badge bg-primary">Ενεργή</span>`;
      case 'Ακυρωμένη': return `<span class="badge bg-secondary">Ακυρωμένη</span>`;
      default: return `<span class="badge bg-light text-dark">${escapeHTML(status || '-')}</span>`;
    }
  };

  const invitationBadge = (resp) => {
    if (resp === 'Αποδέχθηκε') return '<span class="badge bg-success">Αποδέχθηκε</span>';
    if (resp === 'Απέρριψε') return '<span class="badge bg-danger">Απέρριψε</span>';
    return '<span class="badge bg-secondary">Προσκεκλημένος</span>';
  };

  const getTopicById = (id) => state.topics.find(t => String(t.id) === String(id));
  const getLecturerNameById = (pid) =>
    state.lecturers?.find?.(l => l.id === Number(pid))?.name || `#${pid}`;

  // === Κανόνας οριστικοποίησης: ≥2 αποδοχές προσκεκλημένων ===
  const countAcceptedInvitations = (thesis) =>
    (thesis.invitations || []).filter(inv => inv.response === 'Αποδέχθηκε').length;
  const canFinalizeThesis = (thesis) => countAcceptedInvitations(thesis) >= 2;

  // --- Invitations Modal Render ---
  const renderInvitationsModal = (thesis) => {
    const topic = thesis.topic || getTopicById(thesis.topicId) || { title: '(Άγνωστο θέμα)' };
    invitationsTopicTitle.textContent = topic.title;
    const acceptedN = countAcceptedInvitations(thesis);
    invitationsStudentLine.textContent = thesis.student
      ? `Φοιτητής/τρια: ${thesis.student} • Αποδεκτοί: ${acceptedN}`
      : `Αποδεκτοί: ${acceptedN}`;

    invitationsTableBody.innerHTML = '';
    const list = thesis.invitations || [];
    if (!list.length) {
      invitationsTableBody.innerHTML = `<tr><td colspan="5" class="text-muted">Δεν υπάρχουν προσκεκλημένα μέλη.</td></tr>`;
    } else {
      list.forEach(inv => {
        const acceptedAt = inv.response === 'Αποδέχθηκε' ? inv.responseDate : null;
        const rejectedAt = inv.response === 'Απέρριψε' ? inv.responseDate : null;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${escapeHTML(getLecturerNameById(inv.professorId))}</td>
          <td>${invitationBadge(inv.response)}</td>
          <td>${fmtDate(inv.createdAt)}</td>
          <td>${fmtDate(acceptedAt)}</td>
          <td>${fmtDate(rejectedAt)}</td>
        `;
        invitationsTableBody.appendChild(tr);
      });
    }

    if (invitationsModal) invitationsModal.show();
    else alert('Προσκληθέντα μέλη:\n' + (list.map(inv => `• ${getLecturerNameById(inv.professorId)} - ${inv.response || 'Προσκεκλημένος'}`).join('\n') || '—'));
  };

  // === ΑΝΑΚΤΗΣΗ ΔΕΔΟΜΕΝΩΝ ΑΠΟ ΤΑ ΔΙΚΑ ΣΑΣ APIs ===
  const fetchStudents = async (force = false) => {
    if (state.studentsLoaded && !force) return;
    try {
      const res = await getStudents(); // <-- YOUR FUNCTION
      const raw = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      state.students = (raw || []).map(u => {
        const fullName = u.name ?? [u.firstName, u.lastName].filter(Boolean).join(' ');
        const fallbackName = (fullName?.trim()) || (u.email ? String(u.email).split('@')[0] : `#${u.id}`);
        return { id: u.id, am: u.am ?? u.studentNumber ?? '', name: fallbackName };
      });
      state.studentsLoaded = true;
    } catch (err) {
      console.error('Σφάλμα φόρτωσης φοιτητών:', err);
    }
  };

  const fetchTopics = async () => {
    try {
      const res = await getMyUnassignedTopics();
      state.topics = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
    } catch (err) {
      console.error('Σφάλμα φόρτωσης θεμάτων:', err);
      state.topics = [];
    }
  };

  const fetchLecturers = async () => {
    try {
      // TODO: getLecturers()
      state.lecturers = state.lecturers || [];
    } catch (err) {
      console.error('Σφάλμα φόρτωσης διδασκόντων:', err);
      state.lecturers = [];
    }
  };

  const fetchTheses = async () => {
    try {
      const res = await getUnderAssignementThesis();
      const raw = Array.isArray(res)
        ? res
        : (Array.isArray(res?.data) ? res.data : (Array.isArray(res?.items) ? res.items : []));
      state.theses = raw.map(srv => ({
        id: Number(srv?.id),
        status: 'Υπό Ανάθεση',
        startDate: srv?.startDate ?? null,
        topicId: Number(srv?.topicId),
        topic: { title: String(srv?.topic ?? '(Άγνωστο θέμα)') },
        student: srv?.student ?? null,
        studentId: srv?.studentId ?? null,
        supervisor: srv?.supervisor ?? null,
        supervisorId: srv?.supervisorId ?? null,
        invitations: Array.isArray(srv?.invitations) ? srv.invitations : []
      }));
    } catch (err) {
      console.error('Σφάλμα φόρτωσης διπλωματικών:', err);
      state.theses = [];
    }
  };

  const normalizeInvitationResponse = (resp) => {
    const r = String(resp || '').toLowerCase();
    if (r === 'accepted') return 'Αποδέχθηκε';
    if (r === 'rejected') return 'Απέρριψε';
    return 'Προσκεκλημένος';
  };

  // Lazy loader (with simple caching). Set {force:true} to always refetch.
  const loadThesisInvitations = async (thesisId, { force = false } = {}) => {
    const th = state.theses.find(t => Number(t.id) === Number(thesisId));
    if (!th) return [];
    if (th._invitationsLoaded && !force && Array.isArray(th.invitations) && th.invitations.length) {
      return th.invitations;
    }
    const invRes = await getThesisInvitations(thesisId); // <-- your API
    const invRaw = Array.isArray(invRes?.data) ? invRes.data : (Array.isArray(invRes) ? invRes : []);
    th.invitations = (invRaw || []).map(inv => ({
      id: Number(inv.id),
      response: normalizeInvitationResponse(inv.response),
      responseDate: inv.responseDate ?? null,
      professorId: Number(inv.professorId),
      thesisId: Number(inv.thesisId ?? thesisId),
      createdAt: inv.createdAt ?? null,
      updatedAt: inv.updatedAt ?? null
    }));
    th._invitationsLoaded = true;
    return th.invitations;
  };

  // --- Render Πίνακα (Free + Under Assignment) ---
  const renderTopicsTable = async () => {
    await fetchTheses();
    await fetchTopics();

    if (!myTopicsTableBody) return;
    myTopicsTableBody.innerHTML = '';

    const freeTopics = state.topics || [];
    const pendingTheses = state.theses || [];

    if (!freeTopics.length && !pendingTheses.length) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="4" class="text-center text-muted py-4">Δεν υπάρχουν διαθέσιμα θέματα ή εκκρεμείς αναθέσεις.</td>`;
      myTopicsTableBody.appendChild(tr);
      return;
    }

    // 1) ΕΛΕΥΘΕΡΑ ΘΕΜΑΤΑ
    freeTopics.forEach(topic => {
      const row = document.createElement('tr');
      row.dataset.topicId = topic.id;
      row.innerHTML = `
        <td>${escapeHTML(topic.title)}</td>
        <td>${statusBadge('Ελεύθερο')}</td>
        <td>-</td>
        <td class="text-center">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-primary assign-btn" title="Ανάθεση" aria-label="Ανάθεση σε φοιτητή">
              <i class="bi bi-person-plus"></i>
            </button>
          </div>
        </td>
      `;
      myTopicsTableBody.appendChild(row);
    });

    // 2) ΥΠΟ ΑΝΑΘΕΣΗ ΔΙΠΛΩΜΑΤΙΚΕΣ  (NO finalize button here anymore)
    pendingTheses.forEach(thesis => {
      const topic = thesis.topic || getTopicById(thesis.topicId) || { title: '(Άγνωστο θέμα)' };
      const row = document.createElement('tr');
      row.dataset.thesisId = thesis.id;
      row.dataset.topicId = thesis.topicId;
      row.innerHTML = `
        <td>${escapeHTML(topic.title)}</td>
        <td>${statusBadge(thesis.status)}</td>
        <td>${escapeHTML(thesis.student || '-')}</td>
        <td class="text-center">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary members-btn" title="Προσκεκλημένα Μέλη" aria-label="Προσκεκλημένα μέλη">
              <i class="bi bi-people"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger unassign-btn" title="Ακύρωση Ανάθεσης" aria-label="Ακύρωση ανάθεσης">
              <i class="bi bi-person-dash"></i>
            </button>
          </div>
        </td>
      `;
      myTopicsTableBody.appendChild(row);
    });
  };

  // --- Αναζήτηση Φοιτητών ---
  const filterStudents = (query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    return (state.students || [])
      .filter(s =>
        (s.am && String(s.am).includes(q)) ||
        (s.name && s.name.toLowerCase().includes(q))
      )
      .slice(0, 10);
  };

  const renderStudentResults = (list) => {
    studentResults.innerHTML = '';
    if (!list.length) {
      studentResults.innerHTML = `<div class="list-group-item text-muted">Δεν βρέθηκαν φοιτητές.</div>`;
      return;
    }
    list.forEach(s => {
      const item = document.createElement('button');
      item.type = 'button';
      item.className = 'list-group-item list-group-item-action d-flex justify-content-between align-items-center';
      item.dataset.studentId = s.id;
      item.innerHTML = `
        <span>
          <strong>${escapeHTML(s.name)}</strong><br>
          <small class="text-muted">Α.Μ.: ${escapeHTML(s.am || '—')}</small>
        </span>
        <i class="bi bi-check2-circle"></i>
      `;
      if (selectedStudent?.id === s.id) item.classList.add('active');
      studentResults.appendChild(item);
    });
  };

  const resetAssignModalState = () => {
    selectedStudent = null;
    if (studentSearchInput) studentSearchInput.value = '';
    studentResults.innerHTML = '';
    assignStudentForm?.querySelector('button[type="submit"]')?.removeAttribute('disabled');
  };

  // --- Debounce util ---
  const debounce = (fn, wait = 250) => {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  };

  // --- Event Listeners πίνακα ---
  myTopicsTableBody?.addEventListener('click', async (e) => {
    const target = e.target;

    // Assign σε "Ελεύθερο" topic
    const assignBtn = target.closest('.assign-btn');
    if (assignBtn) {
      const row = assignBtn.closest('tr');
      const topicId = row?.dataset.topicId;
      const topic = getTopicById(topicId);
      if (!topic) return;

      assignTopicIdInput.value = topic.id;
      assignTopicTitle.textContent = topic.title;

      resetAssignModalState();
      assignStudentModal?.show();
      return;
    }

    // Προσκεκλημένα μέλη (Invitations)
    const membersBtn = target.closest('.members-btn');
    if (membersBtn) {
      const row = membersBtn.closest('tr');
      const thesisId = Number(row?.dataset.thesisId);

      // Fetch fresh invitations on demand
      await loadThesisInvitations(thesisId, { force: true });

      // Configure modal finalize button based on current thesis state
      const thesis = state.theses.find(th => th.id === thesisId);
        if ( canFinalizeThesis(thesis)) {
          invitationsFinalizeBtn.removeAttribute('disabled');
          invitationsFinalizeBtn.title = 'Οριστικοποίηση';
        } else {
          invitationsFinalizeBtn.setAttribute('disabled', 'disabled');
          invitationsFinalizeBtn.title = 'Απαιτούνται ≥2 αποδοχές προσκεκλημένων';
        } 
        invitationsFinalizeBtn.dataset.thesisId = String(thesisId);
        renderInvitationsModal(thesis);
      
      return;
    }

    const unassignBtn = target.closest('.unassign-btn');
    if (unassignBtn) {
      const row = unassignBtn.closest('tr');
      const thesisId = Number(row?.dataset.thesisId);
      const thesis = state.theses.find(th => th.id === thesisId);
      if (!thesis) return;

      confirmUnassignModalLabel.textContent = 'Ακύρωση Ανάθεσης';
      const topic = thesis.topic || getTopicById(thesis.topicId) || { title: '(Άγνωστο θέμα)' };
      confirmUnassignTitle.textContent = topic.title;
      confirmUnassignBtn.dataset.thesisId = thesis.id;
      confirmUnassignBtn.textContent = 'Ακύρωση';
      confirmUnassignBtn.classList.remove('btn-secondary');
      confirmUnassignBtn.classList.add('btn-danger');
      confirmUnassignModal?.show();
      return;
    }
  });

  // Finalize click inside the Invitations modal
  invitationsFinalizeBtn?.addEventListener('click', async () => {
    const thesisId = Number(invitationsFinalizeBtn.dataset.thesisId);
    const thesis = state.theses.find(th => th.id === thesisId);
    if (!thesis) return;

 
    try {
       await activateThesis(thesisId); 

      invitationsModal?.hide();
      renderTopicsTable();
    } catch (err) {
      console.error('Σφάλμα οριστικοποίησης:', err);
      alert('Αποτυχία οριστικοποίησης. Δοκιμάστε ξανά.');
    } 
  });

  // Επιβεβαίωση Ακύρωσης Ανάθεσης
  confirmUnassignBtn?.addEventListener('click', async () => {
    const thesisId = Number(confirmUnassignBtn.dataset.thesisId);
    if (!thesisId) return;

    await unassignThesis(thesisId);
    delete confirmUnassignBtn.dataset.thesisId;
    confirmUnassignModal?.hide();
    renderTopicsTable();
  });

  // --- Αναζήτηση φοιτητή στο modal ---
  studentSearchInput?.addEventListener('input', debounce((e) => {
    const list = filterStudents(e.target.value);
    renderStudentResults(list);
  }, 250));

  // Επιλογή φοιτητή (κλικ)
  studentResults.addEventListener('click', (e) => {
    const btn = e.target.closest('.list-group-item');
    if (!btn) return;
    const sid = Number(btn.dataset.studentId);
    selectedStudent = (state.students || []).find(s => s.id === sid) || null;

    [...studentResults.children].forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    if (selectedStudent && studentSearchInput) {
      studentSearchInput.value = `${selectedStudent.name} (${selectedStudent.am || '—'})`;
    }
  });

  // Πληκτρολόγιο στο πεδίο αναζήτησης
  studentSearchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (!selectedStudent) {
        const matches = filterStudents(studentSearchInput.value);
        if (matches.length >= 1) {
          selectedStudent = matches[0];
          renderStudentResults(matches);
          studentSearchInput.value = `${selectedStudent.name} (${selectedStudent.am || '—'})`;
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      resetAssignModalState();
    }
  });

  // Υποβολή ανάθεσης
  assignStudentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (submittingAssign) return;
    submittingAssign = true;

    const submitBtn = assignStudentForm.querySelector('button[type="submit"]');
    submitBtn?.setAttribute('disabled', 'disabled');

    const topicId = Number(assignTopicIdInput.value);
    const topic = getTopicById(topicId);
    if (!topic) {
      alert('Σφάλμα: Το θέμα δεν βρέθηκε.');
      submittingAssign = false;
      submitBtn?.removeAttribute('disabled');
      return;
    }

    if (!selectedStudent) {
      const typed = studentSearchInput.value.trim();
      const matches = filterStudents(typed);
      if (matches.length === 1) selectedStudent = matches[0];
    }
    if (!selectedStudent) {
      alert('Επίλεξε έναν φοιτητή από τα αποτελέσματα.');
      submittingAssign = false;
      submitBtn?.removeAttribute('disabled');
      return;
    }

    await assignTopic(topicId, selectedStudent.id);
    resetAssignModalState();
    assignStudentModal?.hide();
    submitBtn?.removeAttribute('disabled');
    submittingAssign = false;

    renderTopicsTable();
  });

  // reset modal όταν κλείνει
  assignStudentModalEl?.addEventListener('hidden.bs.modal', resetAssignModalState);

  // --- ΑΡΧΙΚΟ LOAD ---
  try {
    // const me = await getMe(); state.currentProfessor = { id: me.id, name: me.name };
    await fetchStudents();
    await fetchLecturers();
    renderTopicsTable();
  } catch (err) {
    console.error('Αρχικοποίηση απέτυχε:', err);
    renderTopicsTable();
  }
});
