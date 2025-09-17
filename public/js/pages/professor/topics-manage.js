document.addEventListener('DOMContentLoaded', () => {
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

  // === Local state (αντί για sampleData) ===
  /** @type {Array<{id:number|string,title:string,summary:string,status:string,descriptionFile:string|null}>} */
  let allMyTopics = [];

  // Δημιουργούμε θέση προεπισκόπησης/συνδέσμου για το τρέχον αρχείο (δεν αλλάζουμε HTML)
  let modalFilePreview = document.getElementById('modal-file-preview');
  if (!modalFilePreview) {
    modalFilePreview = document.createElement('div');
    modalFilePreview.id = 'modal-file-preview';
    modalFilePreview.className = 'mt-2';
    modalTopicFile.insertAdjacentElement('afterend', modalFilePreview);
  }

  // === Viewer για inline PDF ===
  let modalFileViewer = document.getElementById('modal-file-viewer');
  if (!modalFileViewer) {
    modalFileViewer = document.createElement('div');
    modalFileViewer.id = 'modal-file-viewer';
    modalFileViewer.className = 'mt-3';
    modalTopicFile.insertAdjacentElement('afterend', modalFileViewer);
  }
  let currentPdfUrl = null;
  const clearViewer = () => {
    if (currentPdfUrl) URL.revokeObjectURL(currentPdfUrl);
    currentPdfUrl = null;
    modalFileViewer.innerHTML = '';
  };
  document.getElementById('topic-details-modal')
    .addEventListener('hidden.bs.modal', clearViewer);

  // --- Βοηθητικές συναρτήσεις mapping/status/file ---
  const normalizeTopic = (raw) => {
    const id = raw.id ?? raw.topicId ?? raw.uuid ?? Date.now();
    const title = raw.title ?? raw.name ?? 'Χωρίς τίτλο';
    const summary = raw.summary ?? raw.description ?? '';
    const statusApi = (raw.status ?? '').toString().toLowerCase();
    let status = 'Ελεύθερο';
    if (statusApi.includes('unassigned') || statusApi.includes('free')) status = 'Ελεύθερο';
    else if (statusApi.includes('pending') || statusApi.includes('assign')) status = 'Υπό Ανάθεση';
    const fileName =
      raw.descriptionFile ??
      raw.fileName ??
      raw.description_file ??
      raw.file ??
      null;
    return { id, title, summary, status, descriptionFile: fileName || null };
  };


  // --- Renderers ---
  const renderLoadingRow = (text = 'Φόρτωση...') => {
    myTopicsTableBody.innerHTML = `
      <tr><td colspan="3" class="text-center text-muted py-4">
        <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>${text}
      </td></tr>`;
  };

  const renderErrorRow = (msg = 'Κάτι πήγε στραβά κατά τη φόρτωση.') => {
    myTopicsTableBody.innerHTML = `
      <tr><td colspan="3" class="text-center text-danger py-4">
        <i class="bi bi-exclamation-triangle me-2"></i>${msg}
      </td></tr>`;
  };

  const renderEmptyRow = () => {
    myTopicsTableBody.innerHTML = `
      <tr><td colspan="3" class="text-center text-muted py-4">
        Δεν βρέθηκαν θέματα.
      </td></tr>`;
  };

  const renderTopicsTable = () => {
    if (!allMyTopics.length) return renderEmptyRow();
    myTopicsTableBody.innerHTML = ''; // Καθαρισμός πίνακα

    allMyTopics.forEach(topic => {
      const row = document.createElement('tr');
      row.setAttribute('data-topic-id', topic.id);

      const statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;

      const actions = `
        <div class="d-flex justify-content-center gap-2">
          <button class="btn btn-sm btn-info view-details-btn" title="Λεπτομέρειες"><i class="bi bi-eye"></i></button>
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
    clearViewer(); // reset old inline preview
    if (topic) {
      modalFilePreview.innerHTML = `
        <div class="mt-2 d-flex flex-wrap align-items-center gap-2">
          <small class="text-muted d-block">Αρχείο περιγραφής:</small>
          <button type="button" class="btn btn-sm btn-outline-primary preview-description-btn" data-topic-id="${topic.id}">
            <i class="bi bi-eye me-1"></i> Προβολή στο παράθυρο
          </button>
        </div>
      `;
    } else {
      modalFilePreview.innerHTML = `<small class="text-muted">Δεν υπάρχει αρχείο περιγραφής.</small>`;
    }
  };

  // --- API: φόρτωση θεμάτων (αντικαθιστά το sampleData) ---
  const loadMyUnassignedTopics = async () => {
    try {
      renderLoadingRow();
      const res = await getMyUnassignedTopics();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      allMyTopics = list.map(normalizeTopic);
      renderTopicsTable();
    } catch (err) {
      console.error(err);
      renderErrorRow('Αποτυχία φόρτωσης θεμάτων. Δοκίμασε ανανέωση.');
    }
  };

  // --- Event Listeners ---
  createTopicForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title')?.trim();
    const summary = formData.get('description')?.trim();
    const file = createPdfInput.files?.[0] ?? null;

    try {
      // 1) create topic (returns the new topic, including its id)
      const created = await createThesisTopic({ title, summary });

      // 2) upload description file if present
      if (file) {
        try {
          await putDescription(created.id, file);
          alert('Το θέμα δημιουργήθηκε με επιτυχία.');
        } catch (err) {
          console.error('Αποτυχία upload περιγραφής:', err);
          alert('Το θέμα δημιουργήθηκε, αλλά το αρχείο περιγραφής δεν ανέβηκε.');
        }
      }

      // 3) push to state & render
      allMyTopics.unshift(normalizeTopic(created));
      renderTopicsTable();

      createTopicModal.hide();
      e.target.reset();
    } catch (err) {
      console.error('Αποτυχία δημιουργίας:', err);
      alert('Σφάλμα κατά τη δημιουργία θέματος.');
    }
  });

  myTopicsTableBody.addEventListener('click', (e) => {
    const row = e.target.closest('tr');
    const topicId = row?.dataset.topicId;
    if (!topicId) return;

    const topic = allMyTopics.find(t => String(t.id) === String(topicId));
    if (!topic) return;

    if (e.target.closest('.view-details-btn')) {
      modalTopicId.value = topic.id;
      modalTopicTitle.value = topic.title;
      modalTopicDescription.value = topic.summary;
      modalTopicFile.value = ''; // καθαρίζουμε το file input
      renderModalFilePreview(topic);
      setModalState(false);
      topicDetailsModal.show();
    }
  });

  editBtn.addEventListener('click', () => setModalState(true));

  saveBtn.addEventListener('click', async () => {
    const id = modalTopicId.value;
    const title = modalTopicTitle.value.trim();
    const summary = modalTopicDescription.value.trim();
    const file = modalTopicFile.files?.[0] ?? null;

    try {
      // 1) update topic main data
      const updatedTopic = await updateThesisTopic(id, { title, summary });

      // 2) if a new file is chosen, upload/replace the description
      if (file) {
        try {
          await putDescription(id, file);
        } catch (err) {
          console.error('Αποτυχία upload περιγραφής:', err);
          alert('Το θέμα ενημερώθηκε, αλλά το αρχείο περιγραφής δεν ανέβηκε.');
        }
      }

      // 3) update local state
      const index = allMyTopics.findIndex(t => String(t.id) === String(id));
      if (index !== -1) {
        allMyTopics[index] = { ...allMyTopics[index], ...normalizeTopic(updatedTopic) };
      }

      // 4) refresh preview/link
      renderModalFilePreview({ id, ...updatedTopic });

      setModalState(false);
      topicDetailsModal.hide();
      renderTopicsTable();
    } catch (err) {
      console.error('Αποτυχία ενημέρωσης:', err);
      alert('Σφάλμα κατά την ενημέρωση θέματος.');
    }
  });

  // --- Inline PDF preview handler (USES getDescription) ---
  modalFilePreview.addEventListener('click', async (e) => {
    const btn = e.target.closest('.preview-description-btn');
    if (!btn) return;

    const topicId = btn.getAttribute('data-topic-id');
    if (!topicId) return;

    btn.disabled = true;
    modalFileViewer.innerHTML = `
      <div class="text-center py-3">
        <div class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
        Φόρτωση PDF...
      </div>`;

    try {
      // Call your helper
      const res = await getDescription(topicId);

      // If your request() returns a fetch Response:
      const response = res && typeof res.blob === 'function' ? res : null;
      if (!response || (response.ok === false)) {
        throw new Error('Failed to load PDF');
      }

      const pdfBlob = await response.blob();
      clearViewer();

      currentPdfUrl = URL.createObjectURL(pdfBlob);
      const iframe = document.createElement('iframe');
      iframe.src = currentPdfUrl;
      iframe.style.width = '100%';
      iframe.style.height = '60vh';
      iframe.title = 'Προεπισκόπηση PDF';
      iframe.className = 'border rounded';
      modalFileViewer.appendChild(iframe);
    } catch (err) {
      console.error(err);
      modalFileViewer.innerHTML = `<div class="text-danger small">Αποτυχία φόρτωσης PDF.</div>`;
    } finally {
      btn.disabled = false;
    }
  });

  // --- Αρχικό load από API ---
  loadMyUnassignedTopics();
});
