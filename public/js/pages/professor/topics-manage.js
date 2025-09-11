document.addEventListener('DOMContentLoaded', () => {
  // === Ρύθμιση: βάση URL για τα αρχεία PDF (άλλαξέ το ανάλογα με το backend σου) ===
  const FILE_BASE_URL = '/uploads/';

  // Δείγμα δεδομένων (θα έρθει από backend)
  const sampleData = {
    allMyTopics: [
      { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', summary: 'Αυτή είναι η περιγραφή για την ανάλυση μεγάλων δεδομένων.', status: 'Ελεύθερο', descriptionFile: null },
      { id: 3, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', summary: 'Αυτή είναι η περιγραφή για την ΤΝ στην ιατρική.', status: 'Ελεύθερο', descriptionFile: null },
      { id: 5, title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα', summary: 'Αυτή είναι η περιγραφή για την μηχανική μάθηση.', status: 'Ελεύθερο', descriptionFile: 'ml_embedded.pdf' }
    ]
  };

  // --- Επιλογείς στοιχείων ---
  const myTopicsTableBody = document.getElementById('my-topics-table-body');

  // Create Modal
  const createTopicModal = new bootstrap.Modal(document.getElementById('create-topic-modal'));
  const createTopicForm = document.getElementById('create-topic-form');
  const createPdfInput = document.getElementById('create-pdfFile');

  // Details Modal
  const topicDetailsModal = new bootstrap.Modal(document.getElementById('topic-details-modal'));
  const modalTopicId = document.getElementById('modal-topic-id');
  const modalTopicTitle = document.getElementById('modal-topic-title');
  const modalTopicDescription = document.getElementById('modal-topic-description');
  const modalTopicFile = document.getElementById('modal-topic-file');
  const editBtn = document.getElementById('edit-topic-btn');
  const saveBtn = document.getElementById('save-topic-btn');

  // Δημιουργούμε θέση προεπισκόπησης/συνδέσμου για το τρέχον αρχείο (δεν αλλάζουμε HTML)
  let modalFilePreview = document.getElementById('modal-file-preview');
  if (!modalFilePreview) {
    modalFilePreview = document.createElement('div');
    modalFilePreview.id = 'modal-file-preview';
    modalFilePreview.className = 'mt-2';
    modalTopicFile.insertAdjacentElement('afterend', modalFilePreview);
  }

  // --- Συναρτήσεις ---
  const renderTopicsTable = () => {
    myTopicsTableBody.innerHTML = ''; // Καθαρισμός πίνακα
    sampleData.allMyTopics.forEach(topic => {
      const row = document.createElement('tr');
      row.setAttribute('data-topic-id', topic.id);

      let statusBadge;
      if (topic.status === 'Ελεύθερο') statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;
      else if (topic.status === 'Υπό Ανάθεση') statusBadge = `<span class="badge bg-warning text-dark">Υπό Ανάθεση</span>`;
      else statusBadge = `<span class="badge bg-primary">Ενεργή</span>`;

      const fileBtn = topic.descriptionFile
        ? `<a class="btn btn-sm btn-outline-secondary" href="${FILE_BASE_URL}${encodeURIComponent(topic.descriptionFile)}" target="_blank" rel="noopener" title="Περιγραφή (PDF)">
             <i class="bi bi-file-earmark-pdf"></i>
           </a>`
        : '';

      const actions = `
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-info view-details-btn" title="Λεπτομέρειες"><i class="bi bi-eye"></i></button>
          ${fileBtn}
        </div>
      `;

      row.innerHTML = `
        <td>${topic.title}</td>
        <td>${statusBadge}</td>
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

  const renderModalFilePreview = (topic) => {
    if (topic.descriptionFile) {
      const url = FILE_BASE_URL + encodeURIComponent(topic.descriptionFile);
      modalFilePreview.innerHTML = `
        <div class="mt-2">
          <small class="text-muted d-block mb-1">Τρέχον αρχείο περιγραφής:</small>
          <a href="${url}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">
            <i class="bi bi-file-earmark-pdf me-1"></i>${topic.descriptionFile}
          </a>
        </div>
      `;
    } else {
      modalFilePreview.innerHTML = `<small class="text-muted">Δεν υπάρχει αρχείο περιγραφής.</small>`;
    }
  };

  // --- Event Listeners ---
  createTopicForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const newTopic = {
      id: Date.now(), // προσωρινό unique ID
      title: formData.get('title'),
      summary: formData.get('description'),
      status: 'Ελεύθερο',
      // αποθηκεύουμε μόνο το όνομα αρχείου για το demo (στο πραγματικό backend θα λάβεις URL)
      descriptionFile: createPdfInput.files && createPdfInput.files[0] ? createPdfInput.files[0].name : null
    };
    sampleData.allMyTopics.unshift(newTopic); // Προσθήκη αρχής
    renderTopicsTable();
    createTopicModal.hide();
    e.target.reset();
  });

  myTopicsTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    const topicId = row?.dataset.topicId;
    if (!topicId) return;

    const topic = sampleData.allMyTopics.find(t => t.id == topicId);
    if (!topic) return;

    if (e.target.closest('.view-details-btn')) {
      modalTopicId.value = topic.id;
      modalTopicTitle.value = topic.title;
      modalTopicDescription.value = topic.summary;
      modalTopicFile.value = ''; // καθαρίζουμε το file input (ασφάλεια browser)
      renderModalFilePreview(topic);
      setModalState(false);
      topicDetailsModal.show();
    }
  });

  editBtn.addEventListener('click', () => setModalState(true));

  saveBtn.addEventListener('click', () => {
    const id = Number(modalTopicId.value);
    const topic = sampleData.allMyTopics.find(t => t.id === id);
    if (topic) {
      topic.title = modalTopicTitle.value.trim();
      topic.summary = modalTopicDescription.value.trim();

      // Αν επιλέχθηκε νέο αρχείο, ενημερώνουμε το όνομα
      if (modalTopicFile.files && modalTopicFile.files[0]) {
        topic.descriptionFile = modalTopicFile.files[0].name;
      }

      renderModalFilePreview(topic);
    }
    setModalState(false);
    topicDetailsModal.hide();
    renderTopicsTable();
  });

  // --- Αρχικό render ---
  renderTopicsTable();
});
