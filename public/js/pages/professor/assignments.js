document.addEventListener('DOMContentLoaded', () => {
  // === ΝΕΑ ΔΟΜΗ ΔΕΔΟΜΕΝΩΝ ===
  const state = {
    currentProfessor: { id: 9001, name: 'Δρ. Αλέξανδρος Παπαδόπουλος' },

    // ΘΕΜΑΤΑ
    topics: [
      { id: 1, professorId: 9001, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', summary: 'Αυτή είναι η περιγραφή...' },
      { id: 3, professorId: 9001, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', summary: 'Αυτή είναι η περιγραφή...' },
      { id: 5, professorId: 9001, title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα', summary: 'Αυτή είναι η περιγραφή...' },
    ],

    // ΔΙΔΑΣΚΟΝΤΕΣ (για επίλυση professorId -> όνομα)
    lecturers: [
      { id: 201, name: 'Δρ. Ελένη Ρ.' },
      { id: 202, name: 'Δρ. Πέτρος Μ.' },
      { id: 203, name: 'Δρ. Κώστας Λ.' },
      { id: 204, name: 'Δρ. Μαρίνα Χ.' },
      { id: 205, name: 'Δρ. Σοφία Τ.' }
    ],

    // ΔΙΠΛΩΜΑΤΙΚΕΣ (συνδέονται με topicId) + invitations
    theses: [
      {
        id: 100,
        status: 'Υπό Ανάθεση',
        startDate: null,
        topicId: 3,
        topic: null,
        student: 'Γιάννης Παπαδόπουλος',
        studentId: 101,
        supervisor: 'Δρ. Αλέξανδρος Παπαδόπουλος',
        supervisorId: 9001,
        invitations: [
          {
            id: 5001,
            response: 'Αποδέχθηκε',              // 'Αποδέχθηκε' | 'Απέρριψε' | 'Προσκεκλημένος'
            responseDate: '2025-09-03',
            professorId: 201,
            thesisId: 100,
            createdAt: '2025-09-01',            // ημ/νία πρόσκλησης
            updatedAt: '2025-09-03'
          },
          {
            id: 5002,
            response: 'Προσκεκλημένος',
            responseDate: null,
            professorId: 202,
            thesisId: 100,
            createdAt: '2025-09-02',
            updatedAt: '2025-09-02'
          }
        ]
      },
      {
        id: 101,
        status: 'Υπό Ανάθεση',
        startDate: null,
        topicId: 5,
        topic: null,
        student: 'Μαρία Σταύρου',
        studentId: 102,
        supervisor: 'Δρ. Αλέξανδρος Παπαδόπουλος',
        supervisorId: 9001,
        invitations: [
          {
            id: 5003,
            response: 'Αποδέχθηκε',
            responseDate: '2025-08-30',
            professorId: 203,
            thesisId: 101,
            createdAt: '2025-08-29',
            updatedAt: '2025-08-30'
          },
          {
            id: 5004,
            response: 'Αποδέχθηκε',
            responseDate: '2025-09-02',
            professorId: 204,
            thesisId: 101,
            createdAt: '2025-08-31',
            updatedAt: '2025-09-02'
          }
        ]
      }
    ],

    // Ενδεικτικοί φοιτητές
    students: [
      { id: 101, am: '1000123', name: 'Γιάννης Παπαδόπουλος' },
      { id: 102, am: '1000456', name: 'Μαρία Σταύρου' },
      { id: 103, am: '1000789', name: 'Νίκος Δημητρίου' },
      { id: 104, am: '1000999', name: 'Ελένη Κωνσταντίνου' },
      { id: 105, am: '1000111', name: 'Άννα Γεωργίου' }
    ]
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


  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('el-GR') : '-';

  const statusBadge = (status) => {
    switch (status) {
      case 'Ελεύθερο': return `<span class="badge bg-success">Ελεύθερο</span>`;
      case 'Υπό Ανάθεση': return `<span class="badge bg-warning text-dark">Υπό Ανάθεση</span>`;
    }
  };

  const invitationBadge = (resp) => {
    if (resp === 'Αποδέχθηκε') return '<span class="badge bg-success">Αποδέχθηκε</span>';
    if (resp === 'Απέρριψε') return '<span class="badge bg-danger">Απέρριψε</span>';
    return '<span class="badge bg-secondary">Προσκεκλημένος</span>';
  };

  const getTopicById = (id) => state.topics.find(t => String(t.id) === String(id));
  const getThesisByTopicId = (topicId) =>
    state.theses.find(th => String(th.topicId) === String(topicId) && th.status !== 'Ακυρωμένη');
  const getLecturerNameById = (pid) =>
    state.lecturers?.find?.(l => l.id === Number(pid))?.name || `#${pid}`;

  // === Κανόνας οριστικοποίησης: ≥2 αποδοχές προσκεκλημένων ===
  const countAcceptedInvitations = (thesis) =>
    (thesis.invitations || []).filter(inv => inv.response === 'Αποδέχθηκε').length;
  const canFinalizeThesis = (thesis) => countAcceptedInvitations(thesis) >= 2;

  // Δημιουργεί ΝΕΑ thesis όταν γίνεται ανάθεση θέματος σε φοιτητή
  const createThesisForTopic = ({ topic, student }) => {
    if (!topic || !student) return null;
    const existing = getThesisByTopicId(topic.id);
    if (existing) return existing;

    const newId = Math.max(0, ...state.theses.map(x => x.id)) + 1;
    const thesis = {
      id: newId,
      status: 'Υπό Ανάθεση',
      startDate: null,
      topicId: topic.id,
      topic: null, // ή { ...topic } αν θες embedded
      student: student.name,
      studentId: student.id,
      supervisor: state.currentProfessor.name,
      supervisorId: state.currentProfessor.id,
      invitations: [] // αρχικά καμία πρόσκληση
    };
    state.theses.push(thesis);
    return thesis;
  };

  // Διαγράφει μια thesis όταν αφαιρείται ο φοιτητής (το topic ξαναγίνεται «Ελεύθερο»)
  const deleteThesis = (thesisId) => {
    const idx = state.theses.findIndex(th => th.id === Number(thesisId));
    if (idx >= 0) state.theses.splice(idx, 1);
  };

  // Θέματα που είναι "ελεύθερα" = δεν υπάρχει thesis για το topic
  const getFreeTopics = () =>
    state.topics.filter(t => !getThesisByTopicId(t.id));

  // Theses που είναι "υπό ανάθεση"
  const getPendingTheses = () =>
    state.theses.filter(th => th.status === 'Υπό Ανάθεση');

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

  // --- Render Πίνακα (Free + Under Assignment) ---
  const renderTopicsTable = () => {
    if (!myTopicsTableBody) return;
    myTopicsTableBody.innerHTML = '';

    const freeTopics = getFreeTopics();
    const pendingTheses = getPendingTheses();

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

    // 2) ΥΠΟ ΑΝΑΘΕΣΗ ΔΙΠΛΩΜΑΤΙΚΕΣ
    pendingTheses.forEach(thesis => {
      const topic = thesis.topic || getTopicById(thesis.topicId) || { title: '(Άγνωστο θέμα)' };
      const finalizeDisabled = canFinalizeThesis(thesis) ? '' : 'disabled';
      const finalizeTitle = canFinalizeThesis(thesis)
        ? 'Οριστικοποίηση'
        : 'Απαιτούνται ≥2 αποδοχές προσκεκλημένων';

      const row = document.createElement('tr');
      row.dataset.thesisId = thesis.id;
      row.dataset.topicId = thesis.topicId;
      row.innerHTML = `
        <td>${topic.title}</td>
        <td>${statusBadge(thesis.status)}</td>
        <td>${thesis.student || '-'}</td>
        <td class="text-center">
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-outline-secondary members-btn" title="Προσκεκλημένα Μέλη" aria-label="Προσκεκλημένα μέλη">
              <i class="bi bi-people"></i>
            </button>
            <button class="btn btn-sm btn-outline-success finalize-btn" title="${finalizeTitle}" aria-label="Οριστικοποίηση" ${finalizeDisabled}>
              <i class="bi bi-check2-circle"></i>
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
    return state.students
      .filter(s => s.am.includes(q) || s.name.toLowerCase().includes(q))
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
          <small class="text-muted">Α.Μ.: ${escapeHTML(s.am)}</small>
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
  myTopicsTableBody?.addEventListener('click', (e) => {
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
      const thesis = state.theses.find(th => th.id === thesisId);
      if (!thesis) return;
      renderInvitationsModal(thesis);
      return;
    }

    // Οριστικοποίηση thesis
    const finalizeBtn = target.closest('.finalize-btn');
    if (finalizeBtn) {
      const row = finalizeBtn.closest('tr');
      const thesisId = Number(row?.dataset.thesisId);
      const thesis = state.theses.find(th => th.id === thesisId);
      if (!thesis) return;

      // Guard κανόνα (≥2 αποδοχές)
      if (!canFinalizeThesis(thesis)) {
        alert('Απαιτούνται τουλάχιστον 2 αποδοχές από προσκεκλημένους Διδάσκοντες.');
        return;
      }

      if (!confirm('Οριστικοποίηση διπλωματικής; Η κατάσταση θα γίνει "Ενεργή".')) return;
      thesis.status = 'Ενεργή';
      thesis.startDate = new Date().toISOString();

      renderTopicsTable();
      return;
    }

    // Ακύρωση ανάθεσης thesis (επιστρέφει το topic σε "Ελεύθερο")
    const unassignBtn = target.closest('.unassign-btn');
    if (unassignBtn) {
      const row = unassignBtn.closest('tr');
      const thesisId = Number(row?.dataset.thesisId);
      const thesis = state.theses.find(th => th.id === thesisId);
      if (!thesis) return;

      confirmUnassignModalLabel.textContent = 'Ακύρωση Ανάθεσης';
      const topic = getTopicById(thesis.topicId) || { title: '(Άγνωστο θέμα)' };
      confirmUnassignTitle.textContent = topic.title;
      confirmUnassignBtn.dataset.thesisId = thesis.id;
      confirmUnassignBtn.textContent = 'Ακύρωση';
      confirmUnassignBtn.classList.remove('btn-secondary');
      confirmUnassignBtn.classList.add('btn-danger');
      confirmUnassignModal?.show();
      return;
    }
  });

  // Επιβεβαίωση Ακύρωσης Ανάθεσης (διαγράφει thesis & απελευθερώνει το topic)
  confirmUnassignBtn?.addEventListener('click', () => {
    const thesisId = Number(confirmUnassignBtn.dataset.thesisId);
    if (!thesisId) return;

    deleteThesis(thesisId);

    delete confirmUnassignBtn.dataset.thesisId;
    confirmUnassignModal?.hide();
    renderTopicsTable(); // το αντίστοιχο topic ξαναεμφανίζεται στα «Ελεύθερα»
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
    selectedStudent = state.students.find(s => s.id === sid) || null;

    [...studentResults.children].forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    if (selectedStudent && studentSearchInput) {
      studentSearchInput.value = `${selectedStudent.name} (${selectedStudent.am})`;
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
          studentSearchInput.value = `${selectedStudent.name} (${selectedStudent.am})`;
        }
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      resetAssignModalState();
    }
  });

  // Υποβολή ανάθεσης: δημιουργεί ΝΕΑ thesis για το topic
  assignStudentForm?.addEventListener('submit', (e) => {
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

    // auto-pick μοναδικό match αν δεν έγινε explicit επιλογή
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

    // === ΔΗΜΙΟΥΡΓΙΑ THESIS ===
    createThesisForTopic({ topic, student: selectedStudent });

    // καθάρισμα modal & render
    resetAssignModalState();
    assignStudentModal?.hide();
    submitBtn?.removeAttribute('disabled');
    submittingAssign = false;

    renderTopicsTable(); // το topic φεύγει από «Ελεύθερα» και εμφανίζεται ως «Υπό Ανάθεση»
  });

  // reset modal όταν κλείνει
  assignStudentModalEl?.addEventListener('hidden.bs.modal', resetAssignModalState);

  // --- Αρχικό Render ---
  renderTopicsTable();
});
