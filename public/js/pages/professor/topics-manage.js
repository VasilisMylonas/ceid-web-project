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

  // --- Βοηθητικές συναρτήσεις mapping/status/file ---
  const normalizeTopic = (raw) => {
    // Προσπάθησε να “διαβάσεις” εύλογα πεδία από το backend
    const id = raw.id ?? raw.topicId ?? raw.uuid ?? Date.now();
    const title = raw.title ?? raw.name ?? 'Χωρίς τίτλο';
    const summary = raw.summary ?? raw.description ?? '';
    // Αν το API γυρίζει status = 'unassigned' -> το χαρτογραφούμε σε 'Ελεύθερο'
    const statusApi = (raw.status ?? '').toString().toLowerCase();
    let status = 'Ελεύθερο';
    if (statusApi.includes('unassigned') || statusApi.includes('free')) status = 'Ελεύθερο';
    else if (statusApi.includes('pending') || statusApi.includes('assign')) status = 'Υπό Ανάθεση';

    // Διαφορετικές πιθανές θέσεις για το αρχείο
    const fileName =
      raw.descriptionFile ??
      raw.fileName ??
      raw.description_file ??
      raw.file ??
      null;

    return { id, title, summary, status, descriptionFile: fileName || null };
  };

const fileHref = (topic) => {
  // Your API serves the file at /topics/:id/description
  if (!topic?.id) return null;
  return `/topics/${encodeURIComponent(topic.id)}/description`;
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

      let statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;

      const url = fileHref(topic);
      const fileBtn = url
        ? `<a class="btn btn-sm btn-outline-secondary" href="${url}" target="_blank" rel="noopener" title="Περιγραφή (PDF)">
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
        <td>${escapeHtml(topic.title)}</td>
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
  const url = fileHref(topic);
  if (url) {
    modalFilePreview.innerHTML = `
      <div class="mt-2">
        <small class="text-muted d-block mb-1">Αρχείο περιγραφής:</small>
        <a href="${url}" target="_blank" rel="noopener" class="btn btn-sm btn-outline-secondary">
          <i class="bi bi-file-earmark-pdf me-1"></i> Άνοιγμα περιγραφής
        </a>
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
      // Χρήση της συναρτησης που μου έδωσες
      const res = await getMyUnassignedTopics(); // αναμένει π.χ. array ή { data: [...] }
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
    // 1) create topic
    const created = await createThesisTopic({ title, summary });

    // 2) upload file if present (don’t reassign `created`)
    if (file) await updateThesisDescriptionFile(created.id, file);

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
      modalTopicFile.value = ''; // καθαρίζουμε το file input (ασφάλεια browser)
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
    // update title/summary
    const updatedTopic = await updateThesisTopic(id, { title, summary });

    // upload file if user picked one
    if (file) await updateThesisDescriptionFile(id, file);

    // update local state
    const index = allMyTopics.findIndex(t => String(t.id) === String(id));
    if (index !== -1) {
      allMyTopics[index] = { ...allMyTopics[index], ...normalizeTopic(updatedTopic) };
    }

    // refresh preview/link (now points to /topics/:id/description)
    renderModalFilePreview({ id, ...updatedTopic });

    setModalState(false);
    topicDetailsModal.hide();
    renderTopicsTable();
  } catch (err) {
    console.error('Αποτυχία ενημέρωσης:', err);
    alert('Σφάλμα κατά την ενημέρωση θέματος.');
  }
});


  // --- Utils ---
  function escapeHtml(str) {
    return (str ?? '').toString()
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  // --- Αρχικό load από API ---
  loadMyUnassignedTopics();
});