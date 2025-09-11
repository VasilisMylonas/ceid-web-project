document.addEventListener('DOMContentLoaded', () => {
  // === Δείγματα δεδομένων (θα έρθουν από backend) ===
  const sampleData = {
    allMyTopics: [
      { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', description: 'Αυτή είναι η περιγραφή...', status: 'Ελεύθερο', student: null, invitations: [] },
      {
        id: 3,
        title: 'Τεχνητή Νοημοσύνη στην Ιατρική',
        description: 'Αυτή είναι η περιγραφή...',
        status: 'Υπό Ανάθεση',
        student: 'Γιάννης Παπαδόπουλος',
        invitations: [
          { lecturerId: 201, name: 'Δρ. Ελένη Ρ.', invitedAt: '2025-09-01', status: 'Αποδέχθηκε', acceptedAt: '2025-09-03', rejectedAt: null },
          { lecturerId: 202, name: 'Δρ. Πέτρος Μ.', invitedAt: '2025-09-02', status: 'Προσκεκλημένος', acceptedAt: null, rejectedAt: null }
        ]
      },
      {
        id: 5,
        title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα',
        description: 'Αυτή είναι η περιγραφή...',
        status: 'Υπό Ανάθεση',
        student: 'Μαρία Σταύρου',
        invitations: [
          { lecturerId: 203, name: 'Δρ. Κώστας Λ.', invitedAt: '2025-08-29', status: 'Αποδέχθηκε', acceptedAt: '2025-08-30', rejectedAt: null },
          { lecturerId: 204, name: 'Δρ. Μαρίνα Χ.', invitedAt: '2025-08-31', status: 'Αποδέχθηκε', acceptedAt: '2025-09-02', rejectedAt: null }
        ]
      }
    ]
  };

  // Ενδεικτικοί φοιτητές (ID, ΑΜ, Ονοματεπώνυμο)
  const sampleStudents = [
    { id: 101, am: '1000123', name: 'Γιάννης Παπαδόπουλος' },
    { id: 102, am: '1000456', name: 'Μαρία Σταύρου' },
    { id: 103, am: '1000789', name: 'Νίκος Δημητρίου' },
    { id: 104, am: '1000999', name: 'Ελένη Κωνσταντίνου' },
    { id: 105, am: '1000111', name: 'Άννα Γεωργίου' }
  ];

  // --- Επιλογείς στοιχείων ---
  const myTopicsTableBody = document.getElementById('my-topics-table-body');

  // Assign Modal
  const assignStudentModal = new bootstrap.Modal(document.getElementById('assign-student-modal'));
  const assignStudentForm = document.getElementById('assign-student-form');
  const assignTopicIdInput = document.getElementById('assign-topic-id');
  const assignTopicTitle = document.getElementById('assign-topic-title');
  const studentSearchInput = document.getElementById('studentSearch');

  // Confirm Modal (για Αναίρεση ανάθεσης)
  const confirmUnassignModal = new bootstrap.Modal(document.getElementById('confirm-unassign-modal'));
  const confirmUnassignBtn = document.getElementById('confirm-unassign-btn');
  const confirmUnassignTitle = document.getElementById('confirm-unassign-title');
  const confirmUnassignModalLabel = document.getElementById('confirmUnassignModalLabel');

  // Committee Modal
  const committeeModalEl = document.getElementById('committee-modal');
  const committeeModal = new bootstrap.Modal(committeeModalEl);
  const committeeTopicTitle = document.getElementById('committee-topic-title');
  const committeeTableBody = document.getElementById('committee-table-body');
  const finalizeCommitteeBtn = document.getElementById('finalize-committee-btn');

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

  // --- Βοηθητικές συναρτήσεις ---
  const statusBadge = (status) => {
    switch (status) {
      case 'Ελεύθερο': return `<span class="badge bg-success">Ελεύθερο</span>`;
      case 'Υπό Ανάθεση': return `<span class="badge bg-warning text-dark">Υπό Ανάθεση</span>`;
      default: return `<span class="badge bg-light text-dark">${status}</span>`;
    }
  };

  const VISIBLE_STATUSES = new Set(['Ελεύθερο', 'Υπό Ανάθεση']);

  const countAccepted = (topic) =>
    (topic.invitations || []).filter(x => x.status === 'Αποδέχθηκε').length;

  const totalParticipants = (topic) => 1 + countAccepted(topic); // 1 = επιβλέπων

  const canFinalize = (topic) => totalParticipants(topic) >= 3;

  const fmt = (d) => d ? new Date(d).toLocaleDateString('el-GR') : '-';

  const invitationBadge = (st) => {
    if (st === 'Αποδέχθηκε') return '<span class="badge bg-success">Αποδέχθηκε</span>';
    if (st === 'Απέρριψε') return '<span class="badge bg-danger">Απέρριψε</span>';
    return '<span class="badge bg-secondary">Προσκεκλημένος</span>';
  };

  const renderCommitteeModal = (topic) => {
    committeeTopicTitle.textContent = topic.title;
    committeeTableBody.innerHTML = '';

    (topic.invitations || []).forEach(inv => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${inv.name}</td>
        <td>${invitationBadge(inv.status)}</td>
        <td>${fmt(inv.invitedAt)}</td>
        <td>${fmt(inv.acceptedAt)}</td>
        <td>${fmt(inv.rejectedAt)}</td>
      `;
      committeeTableBody.appendChild(tr);
    });

    if (!topic.invitations || topic.invitations.length === 0) {
      committeeTableBody.innerHTML = `
        <tr><td colspan="5" class="text-muted">Δεν υπάρχουν προσκεκλημένα μέλη.</td></tr>
      `;
    }
    finalizeCommitteeBtn.disabled = !canFinalize(topic);
    finalizeCommitteeBtn.dataset.topicId = topic.id;
    committeeModal.show();
  };

  const renderTopicsTable = () => {
    myTopicsTableBody.innerHTML = '';
    const topicsToShow = sampleData.allMyTopics.filter(t => VISIBLE_STATUSES.has(t.status));

    topicsToShow.forEach(topic => {
      const row = document.createElement('tr');
      row.dataset.topicId = topic.id;

      // Actions:
      // - Ελεύθερο: Assign
      // - Υπό Ανάθεση: View Members, Unassign, Finalize (αν >=3 συμμετέχοντες)
      let actions = '';
      if (topic.status === 'Ελεύθερο') {
        actions = `
          <div class="d-flex justify-content-center gap-2">
            <button class="btn btn-sm btn-primary assign-btn" title="Ανάθεση"><i class="bi bi-person-plus"></i></button>
          </div>`;
      } else if (topic.status === 'Υπό Ανάθεση') {
      actions = `
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-outline-secondary members-btn" title="Προσκεκλημένα Μέλη">
            <i class="bi bi-people"></i>
          </button>
          <button class="btn btn-sm btn-outline-danger unassign-btn" title="Ακύρωση Ανάθεσης">
            <i class="bi bi-person-dash"></i>
          </button>
        </div>`;
    }


      row.innerHTML = `
        <td>${topic.title}</td>
        <td>${statusBadge(topic.status)}</td>
        <td>${topic.student || '-'}</td>
        <td class="text-center">${actions}</td>
      `;
      myTopicsTableBody.appendChild(row);
    });
  };

  const filterStudents = (query) => {
    const q = (query || '').trim().toLowerCase();
    if (!q) return [];
    return sampleStudents
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
          <strong>${s.name}</strong><br>
          <small class="text-muted">Α.Μ.: ${s.am}</small>
        </span>
        <i class="bi bi-check2-circle"></i>
      `;
      studentResults.appendChild(item);
    });
  };

  const resetAssignModalState = () => {
    selectedStudent = null;
    if (studentSearchInput) studentSearchInput.value = '';
    studentResults.innerHTML = '';
  };

  // --- Event Listeners πίνακα ---
  myTopicsTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    if (!row) return;
    const topicId = row.dataset.topicId;
    const topic = sampleData.allMyTopics.find(t => String(t.id) === String(topicId));
    if (!topic) return;

    // Ανάθεση (μόνο για 'Ελεύθερο')
    if (e.target.closest('.assign-btn')) {
      assignTopicIdInput.value = topic.id;
      assignTopicTitle.textContent = topic.title;
      resetAssignModalState();
      assignStudentModal.show();
      return;
    }

    // Προσκεκλημένα μέλη (μόνο για 'Υπό Ανάθεση')
    if (e.target.closest('.members-btn')) {
      renderCommitteeModal(topic);
      return;
    }

    // Ακύρωση Ανάθεσης (μόνο για 'Υπό Ανάθεση')
    if (e.target.closest('.unassign-btn')) {
      confirmUnassignModalLabel.textContent = 'Ακύρωση Ανάθεσης';
      confirmUnassignTitle.textContent = topic.title;
      confirmUnassignBtn.dataset.topicId = topic.id;
      confirmUnassignBtn.textContent = 'Ακύρωση';
      confirmUnassignBtn.classList.remove('btn-secondary');
      confirmUnassignBtn.classList.add('btn-danger');
      confirmUnassignModal.show();
      return;
    }
  });

  finalizeCommitteeBtn.addEventListener('click', () => {
  const topicId = finalizeCommitteeBtn.dataset.topicId;
  if (!topicId) return;

  const topic = sampleData.allMyTopics.find(t => String(t.id) === String(topicId));
  if (!topic || !canFinalize(topic)) return;

  if (!confirm('Οριστικοποίηση τριμελούς και θέματος; Η κατάσταση θα γίνει "Ενεργή".')) return;

  topic.status = 'Ενεργή';
  topic.finalizedAt = new Date().toISOString();

  committeeModal.hide();
  renderTopicsTable(); // αν η σελίδα δείχνει μόνο Ελεύθερο/Υπό Ανάθεση, θα εξαφανιστεί
});

  // Επιβεβαίωση Ακύρωσης Ανάθεσης (διαγράφει προσκλήσεις & συμμετοχές τριμελούς)
  confirmUnassignBtn.addEventListener('click', () => {
    const topicId = confirmUnassignBtn.dataset.topicId;
    if (!topicId) return;

    const topic = sampleData.allMyTopics.find(t => String(t.id) === String(topicId));
    if (topic && topic.status === 'Υπό Ανάθεση') {
      topic.student = null;
      topic.status = 'Ελεύθερο';
      topic.invitations = [];        // διαγραφή όλων των προσκλήσεων
      delete topic.finalizedAt;      // ασφάλεια
    }

    delete confirmUnassignBtn.dataset.topicId;
    confirmUnassignModal.hide();
    renderTopicsTable();
  });

  // --- Αναζήτηση φοιτητή στο modal ---
  studentSearchInput?.addEventListener('input', (e) => {
    const list = filterStudents(e.target.value);
    renderStudentResults(list);
  });

  // Επιλογή φοιτητή
  studentResults.addEventListener('click', (e) => {
    const btn = e.target.closest('.list-group-item');
    if (!btn) return;
    const sid = Number(btn.dataset.studentId);
    selectedStudent = sampleStudents.find(s => s.id === sid) || null;

    [...studentResults.children].forEach(el => el.classList.remove('active'));
    btn.classList.add('active');

    if (selectedStudent && studentSearchInput) {
      studentSearchInput.value = `${selectedStudent.name} (${selectedStudent.am})`;
    }
  });

  // Υποβολή ανάθεσης
  assignStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const topicId = Number(assignTopicIdInput.value);
    const topic = sampleData.allMyTopics.find(t => t.id === topicId);
    if (!topic) return;

    if (!selectedStudent) {
      const typed = studentSearchInput.value.trim();
      const matches = filterStudents(typed);
      if (matches.length === 1) selectedStudent = matches[0];
    }
    if (!selectedStudent) {
      alert('Επίλεξε έναν φοιτητή από τα αποτελέσματα.');
      return;
    }

    topic.student = selectedStudent.name;
    topic.status = 'Υπό Ανάθεση';
    // στην πραγματικότητα εδώ θα ξεκινούσαν οι προσκλήσεις με API calls

    resetAssignModalState();
    assignStudentModal.hide();
    renderTopicsTable();
  });

  // reset modal όταν κλείνει
  document.getElementById('assign-student-modal').addEventListener('hidden.bs.modal', resetAssignModalState);

  // --- Αρχικό Render ---
  renderTopicsTable();
});
