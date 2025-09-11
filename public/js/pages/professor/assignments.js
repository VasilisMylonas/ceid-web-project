document.addEventListener('DOMContentLoaded', () => {
  // This sample data will later be fetched from your backend API
  const sampleData = {
    allMyTopics: [
      { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', description: 'Αυτή είναι η περιγραφή για την ανάλυση μεγάλων δεδομένων.', status: 'Ελεύθερο', student: null },
      { id: 3, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', description: 'Αυτή είναι η περιγραφή για την ΤΝ στην ιατρική.', status: 'Υπό Ανάθεση', student: 'Γιάννης Παπαδόπουλος' },
      { id: 5, title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα', description: 'Αυτή είναι η περιγραφή για την μηχανική μάθηση.', status: 'Ενεργή', student: 'Μαρία Σταύρου' }
    ]
  };

  // --- Element Selectors ---
  const myTopicsTableBody = document.getElementById('my-topics-table-body');

  // Create Modal elements
  const createTopicModal = new bootstrap.Modal(document.getElementById('create-topic-modal'));
  const createTopicForm = document.getElementById('create-topic-form');

  // Details Modal elements
  const topicDetailsModal = new bootstrap.Modal(document.getElementById('topic-details-modal'));
  const modalTopicId = document.getElementById('modal-topic-id');
  const modalTopicTitle = document.getElementById('modal-topic-title');
  const modalTopicDescription = document.getElementById('modal-topic-description');
  const modalTopicFile = document.getElementById('modal-topic-file');
  const editBtn = document.getElementById('edit-topic-btn');
  const saveBtn = document.getElementById('save-topic-btn');

  // Assign Modal elements
  const assignStudentModal = new bootstrap.Modal(document.getElementById('assign-student-modal'));
  const assignStudentForm = document.getElementById('assign-student-form');
  const assignTopicIdInput = document.getElementById('assign-topic-id');
  const assignTopicTitle = document.getElementById('assign-topic-title');

  // Confirm Unassign Modal (NEW)
  const confirmUnassignModal = new bootstrap.Modal(document.getElementById('confirm-unassign-modal'));
  const confirmUnassignBtn = document.getElementById('confirm-unassign-btn');
  const confirmUnassignTitle = document.getElementById('confirm-unassign-title');
  let unassignTopicId = null;

  // --- Functions ---
  const renderTopicsTable = () => {
    myTopicsTableBody.innerHTML = ''; // Clear table
    sampleData.allMyTopics.forEach(topic => {
      const row = document.createElement('tr');
      row.setAttribute('data-topic-id', topic.id);

      let statusBadge;
      if (topic.status === 'Ελεύθερο') statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;
      else if (topic.status === 'Υπό Ανάθεση') statusBadge = `<span class="badge bg-warning text-dark">Υπό Ανάθεση</span>`;
      else statusBadge = `<span class="badge bg-primary">Ενεργή</span>`;

      // actions: Αν υπάρχει student -> δείξε Αναίρεση, αλλιώς Ανάθεση
      const actions = `
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-info view-details-btn" title="Λεπτομέρειες"><i class="bi bi-eye"></i></button>
          ${topic.student
            ? '<button class="btn btn-sm btn-outline-danger unassign-btn" title="Αναίρεση Ανάθεσης"><i class="bi bi-person-dash"></i></button>'
            : '<button class="btn btn-sm btn-primary assign-btn" title="Ανάθεση"><i class="bi bi-person-plus"></i></button>'
          }
        </div>
      `;

      row.innerHTML = `
        <td>${topic.title}</td>
        <td>${statusBadge}</td>
        <td>${topic.student || '-'}</td>
        <td>${actions}</td>
      `;
      myTopicsTableBody.appendChild(row);
    });
  };

  const setModalState = (isEditing) => {
    modalTopicTitle.readOnly = !isEditing;
    modalTopicDescription.readOnly = !isEditing;
    modalTopicFile.disabled = !isEditing;
    editBtn.style.display = isEditing ? 'none' : 'block';
    saveBtn.style.display = isEditing ? 'block' : 'none';
  };

  // --- Event Listeners ---
  createTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTopic = {
      id: Date.now(), // Use timestamp for unique ID in sample data
      title: formData.get('title'),
      description: formData.get('description'),
      status: 'Ελεύθερο',
      student: null
    };
    sampleData.allMyTopics.unshift(newTopic); // Add to the beginning of the array
    renderTopicsTable();
    createTopicModal.hide();
    e.target.reset();
  });

  myTopicsTableBody.addEventListener('click', (e) => {
    const topicId = e.target.closest('tr')?.dataset.topicId;
    if (!topicId) return;

    const topic = sampleData.allMyTopics.find(t => t.id == topicId);
    if (!topic) return;

    if (e.target.closest('.view-details-btn')) {
      modalTopicId.value = topic.id;
      modalTopicTitle.value = topic.title;
      modalTopicDescription.value = topic.description;
      setModalState(false);
      topicDetailsModal.show();

    } else if (e.target.closest('.assign-btn')) {
      assignTopicIdInput.value = topic.id;
      assignTopicTitle.textContent = topic.title;
      assignStudentModal.show();

    } else if (e.target.closest('.unassign-btn')) {
      // Άνοιγμα modal επιβεβαίωσης
      unassignTopicId = topic.id;
      confirmUnassignTitle.textContent = topic.title;
      confirmUnassignModal.show();
    }
  });

  // Επιβεβαίωση Αναίρεσης
  confirmUnassignBtn.addEventListener('click', () => {
    if (!unassignTopicId) return;
    const topic = sampleData.allMyTopics.find(t => t.id == unassignTopicId);
    if (topic) {
      topic.student = null;
      topic.status = 'Ελεύθερο';
    }
    unassignTopicId = null;
    confirmUnassignModal.hide();
    renderTopicsTable();
  });

  editBtn.addEventListener('click', () => setModalState(true));

  saveBtn.addEventListener('click', () => {
    // Simulate save
    const id = modalTopicId.value;
    const t = sampleData.allMyTopics.find(x => x.id == id);
    if (t) {
      t.title = modalTopicTitle.value;
      t.description = modalTopicDescription.value;
    }
    setModalState(false);
    topicDetailsModal.hide();
    renderTopicsTable();
  });

  assignStudentForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const topicId = assignTopicIdInput.value;
    const studentIdentifier = e.target.elements.studentIdentifier.value;
    const topic = sampleData.allMyTopics.find(t => t.id == topicId);

    if (topic) {
      topic.status = 'Υπό Ανάθεση';
      topic.student = (studentIdentifier || '').trim();
    }

    assignStudentModal.hide();
    renderTopicsTable();
    e.target.reset();
  });

  // --- Initial Page Load ---
  renderTopicsTable();
});
