(function () {
  const $tableBody = document.getElementById("my-topics-table-body");

  const $createModalEl = document.getElementById("create-topic-modal");
  const $createForm = document.getElementById("create-topic-form");
  const $createTitle = document.getElementById("create-title");
  const $createDescription = document.getElementById("create-description");
  const $createPdf = document.getElementById("create-pdfFile");

  const $detailsModalEl = document.getElementById("topic-details-modal");
  const $modalTopicId = document.getElementById("modal-topic-id");
  const $modalTitle = document.getElementById("modal-topic-title");
  const $modalDescription = document.getElementById("modal-topic-description");
  const $modalFile = document.getElementById("modal-topic-file");
  const $btnEdit = document.getElementById("edit-topic-btn");
  const $btnSave = document.getElementById("save-topic-btn");
  const $btnViewFile = document.getElementById("view-file-btn"); 


  const createModal = window.bootstrap?.Modal.getOrCreateInstance($createModalEl);
  const detailsModal = window.bootstrap?.Modal.getOrCreateInstance($detailsModalEl);

  function badge(content, cls = "bg-secondary") {
    return `<span class="badge ${cls}">${content}</span>`;
  }

  function setDetailsReadOnly(isReadOnly) {
    $modalTitle.readOnly = isReadOnly;
    $modalDescription.readOnly = isReadOnly;
    $modalFile.disabled = isReadOnly;
    $btnEdit.style.display = isReadOnly ? "inline-block" : "none";
    $btnSave.style.display = isReadOnly ? "none" : "inline-block";
  }

  function rowTemplate(topic) {
    return `
      <tr data-id="${topic.id}">
        <td class="text-truncate" style="max-width: 420px">
          <div class="fw-semibold">${topic.title}</div>
          <div class="text-muted small">${topic.summary || ""}</div>
        </td>
        <td>${badge("Προς ανάθεση", "bg-info")}</td>
        <td class="text-center">
          <div class="btn-group" role="group" aria-label="Ενέργειες">
            <button class="btn btn-sm btn-outline-primary" data-action="view">
              <i class="bi bi-eye me-1"></i> Προβολή
            </button>
            <button class="btn btn-sm btn-outline-secondary" data-action="edit">
              <i class="bi bi-pencil-square me-1"></i> Επεξεργασία
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  async function loadTopics() {
    $tableBody.innerHTML = `
      <tr><td colspan="3" class="text-center text-muted py-4">Φόρτωση θεμάτων…</td></tr>
    `;
    try {
      const res = await getMyTopics();
      const topics = Array.isArray(res?.data) ? res.data : (res?.data?.data || []);
      if (!topics.length) {
        $tableBody.innerHTML = `
          <tr><td colspan="3" class="text-center text-muted py-4">Δεν υπάρχουν ελεύθερα θέματα.</td></tr>
        `;
        return;
      }
      $tableBody.innerHTML = topics.map(rowTemplate).join("");
    } catch (err) {
      console.error(err);
      $tableBody.innerHTML = `
        <tr><td colspan="3" class="text-center text-danger py-4">Αποτυχία φόρτωσης θεμάτων.</td></tr>
      `;
    }
  }

  async function handleCreateTopicSubmit(ev) {
    ev.preventDefault();

    const title = $createTitle.value.trim();
    const summary = $createDescription.value.trim();
    const file = $createPdf.files?.[0];

    if (!title || !summary) {
      alert("Συμπληρώστε τίτλο και περιγραφή.");
      return;
    }

    try {
      const createRes = await createTopic(title, summary);
      const created = createRes?.data || createRes; // tolerate wrappers
      const topicId = created?.id || createRes?.id;

      if (file && topicId) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        await putDescriptionFile(topicId, fd);
      }
      $createForm.reset();
      createModal?.hide();
      await loadTopics();
    } catch (err) {
      console.error(err);
      alert("Αποτυχία δημιουργίας θέματος. Προσπαθήστε ξανά.");
    }
  }

function openTopicInModal(topic) {
  $modalTopicId.value = topic.id;
  $modalTitle.value = topic.title || "";
  $modalDescription.value = topic.summary || "";
  $modalFile.value = "";
  setDetailsReadOnly(true);

  $btnViewFile.style.display = "inline-block";

  detailsModal?.show();
}

  async function handleRowActionClick(ev) {
    const btn = ev.target.closest("button[data-action]");
    if (!btn) return;
    const tr = ev.target.closest("tr[data-id]");
    if (!tr) return;

    const id = Number(tr.dataset.id);
    if (!id) return;

    const title = tr.querySelector(".fw-semibold")?.textContent?.trim() || "";
    const summary = tr.querySelector(".text-muted.small")?.textContent?.trim() || "";

    const topic = { id, title, summary };

    if (btn.dataset.action === "view") {
      openTopicInModal(topic);
      return;
    }

    if (btn.dataset.action === "edit") {
      openTopicInModal(topic);
      setDetailsReadOnly(false);
      return;
    }
  }

  async function handleEditClick() {
    setDetailsReadOnly(false);
  }

  async function handleSaveClick() {
    const topicId = Number($modalTopicId.value);
    const title = $modalTitle.value.trim();
    const summary = $modalDescription.value.trim();
    const file = $modalFile.files?.[0] || null;

    if (!topicId) return;
    if (!title || !summary) {
      alert("Συμπληρώστε τίτλο και περιγραφή.");
      return;
    }

    try {
      await updateTopic(topicId, title, summary);

      if (file) {
        const fd = new FormData();
        fd.append("file", file, file.name);
        await putDescriptionFile(topicId, fd);
      }

      setDetailsReadOnly(true);
      detailsModal?.hide();
      await loadTopics();
    } catch (err) {
      console.error(err);
      alert("Αποτυχία αποθήκευσης. Προσπαθήστε ξανά.");
    }
  }

  $createForm.addEventListener("submit", handleCreateTopicSubmit);
  $tableBody.addEventListener("click", handleRowActionClick);
  $btnEdit.addEventListener("click", handleEditClick);
  $btnSave.addEventListener("click", handleSaveClick);
  $btnViewFile.addEventListener("click", () => {
    const topicId = Number($modalTopicId.value);
    if (!topicId) return;
    const url = `${BASE_URL}/v1/topics/${topicId}/description`;
    window.open(url, "_blank");
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") loadTopics();
  });

  loadTopics();
})();
