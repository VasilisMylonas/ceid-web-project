(() => {
  const $tbody = document.querySelector("#my-topics-table-body");

  const assignModal = new bootstrap.Modal(document.querySelector("#assign-student-modal"));
  const $assignForm = document.querySelector("#assign-student-form");
  const $assignTopicId = document.querySelector("#assign-topic-id");
  const $assignTopicTitle = document.querySelector("#assign-topic-title");
  const $studentSearch = document.querySelector("#studentSearch");

  const confirmUnassignModal = new bootstrap.Modal(document.querySelector("#confirm-unassign-modal"));
  const $confirmUnassignTitle = document.querySelector("#confirm-unassign-title");
  const $confirmUnassignBtn = document.querySelector("#confirm-unassign-btn");

  const committeeModal = new bootstrap.Modal(document.querySelector("#committee-modal"));
  const $committeeTopicTitle = document.querySelector("#committee-topic-title");
  const $committeeTableBody = document.querySelector("#committee-table-body");

  let selectedStudent = null;
  let currentThesisForUnassign = null;
  let $studentResultsList = null;

  async function loadTable() {
    $tbody.innerHTML = "";

    try {
      const topicRes = await getMyTopics();

      const [topicsRes, thesesRes] = await Promise.all([getMyTopics(), getMyAssignedTheses()]);
      const topics = topicsRes?.data;
      const theses = thesesRes?.data;

      topics.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="fw-semibold">${t.title}</div>
            <div class="small text-muted">${t.summary ?? ""}</div>
          </td>
           <td><span class="badge ${getThesisStatusBootstrapBgClass("Προς Ανάθεση")}">
           ${Name.ofThesisStatus("Προς Ανάθεση")}</span></td>
          <td>—</td>
          <td class="text-center">
            <button class="btn btn-sm btn-primary"><i class="bi bi-person-check me-1"></i> Ανάθεση</button>
          </td>`;
        tr.querySelector("button").onclick = () => openAssignModal(t);
        $tbody.append(tr);
      });

      theses.forEach(th => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="fw-semibold">${th.topic}</div>
            <div class="small text-muted">ID #${th.topicId}</div>
          </td>
           <td><span class="badge ${getThesisStatusBootstrapBgClass(th.status)}">
           ${Name.ofThesisStatus(th.status)}</span></td>
          <td>
            <div class="fw-semibold">${th.student}</div>
            <div class="small text-muted">ID Φοιτητή: ${th.studentId}</div>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary me-2"><i class="bi bi-people me-1"></i> Προσκλήσεις</button>
            <button class="btn btn-sm btn-danger"><i class="bi bi-arrow-counterclockwise me-1"></i> Αναβολή</button>
          </td>`;
        const [committeeBtn, unassignBtn] = tr.querySelectorAll("button");
        committeeBtn.onclick = () => openCommitteeModal(th);
        unassignBtn.onclick = () => openUnassignModal(th);
        $tbody.append(tr);
      });

      if (!topics.length && !theses.length) {
        $tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted py-4">
          Δεν υπάρχουν διαθέσιμα θέματα ή προσωρινές αναθέσεις.</td></tr>`;
      }
    } catch (err) {
      console.error(err);
      $tbody.innerHTML = `<tr><td colspan="4" class="text-danger">Σφάλμα φόρτωσης δεδομένων.</td></tr>`;
    }
  }

  function ensureStudentResultsList() {
    if ($studentResultsList && document.body.contains($studentResultsList)) return $studentResultsList;
    $studentResultsList = document.createElement("div");
    $studentResultsList.id = "studentResults";
    $studentResultsList.className = "list-group mt-2";
    $studentSearch.insertAdjacentElement("afterend", $studentResultsList);
    return $studentResultsList;
  }

  function renderStudentResults(list) {
    const container = ensureStudentResultsList();
    container.innerHTML = "";

    if (!list.length) {
      container.innerHTML = `<div class="list-group-item text-muted">Δεν βρέθηκαν αποτελέσματα.</div>`;
      return;
    }

    list.slice(0, 8).forEach(s => {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.innerHTML = `<div class="text-start">
                          <div class="fw-semibold">${s.name}</div>
                          <div class="small text-muted">Α.Μ.: ${s.am}${s.email ? " · " + s.email : ""}</div>
                        </div>
                        <i class="bi bi-person-plus"></i>`;
      item.onclick = () => {
        selectedStudent = s;
        $studentSearch.value = `${s.am} — ${s.name}`;
        container.innerHTML = "";
      };
      container.append(item);
    });
  }

  function openAssignModal(topic) {
    selectedStudent = null;
    $assignTopicId.value = topic.id;
    $assignTopicTitle.textContent = topic.title;
    $studentSearch.value = "";
    ensureStudentResultsList().innerHTML = "";
    assignModal.show();
    setTimeout(() => $studentSearch.focus(), 200);
  }

  $studentSearch.addEventListener("input", async () => {
    const q = $studentSearch.value.trim();
    const container = ensureStudentResultsList();
    if (!q) { container.innerHTML = ""; selectedStudent = null; return; }

    container.innerHTML = `<div class="list-group-item">Αναζήτηση...</div>`;
    try {
      const res = await getUnassignedStudents();
      const students = res?.data
      const filtered = students.filter(s =>
        (s.am && s.am.includes(q)) || (s.name && s.name.toLowerCase().includes(q.toLowerCase()))
      );
      renderStudentResults(filtered);
    } catch {
      container.innerHTML = `<div class="list-group-item text-danger">Σφάλμα αναζήτησης.</div>`;
    }
  });

  $assignForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topicId = Number($assignTopicId.value);
    const submitBtn = $assignForm.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Ανάθεση...`;

    try {
      await assignTopic(selectedStudent.id, topicId);
      assignModal.hide();
      await loadTable();
    } catch {
      alert("Αποτυχία ανάθεσης. Προσπαθήστε ξανά.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
  });

  function openUnassignModal(thesis) {
    currentThesisForUnassign = thesis;
    $confirmUnassignTitle.textContent = thesis.topic;
    confirmUnassignModal.show();
  }

  $confirmUnassignBtn.addEventListener("click", async () => {
    if (!currentThesisForUnassign) return;
    const th = currentThesisForUnassign;
    const original = $confirmUnassignBtn.textContent;
    $confirmUnassignBtn.disabled = true;
    $confirmUnassignBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Αναίρεση...`;

    try {
      await unassignTopic(th.id);
      confirmUnassignModal.hide();
      currentThesisForUnassign = null;
      await loadTable();
    } catch {
      alert("Αποτυχία αναβολής. Προσπαθήστε ξανά.");
    } finally {
      $confirmUnassignBtn.disabled = false;
      $confirmUnassignBtn.textContent = original;
    }
  });

  async function openCommitteeModal(thesis) {
    $committeeTopicTitle.textContent = thesis.topic;
    $committeeTableBody.innerHTML = "";

    try {
      const res = await getThesisInvitations(thesis.id);
      const invitations = res?.data;

      if (!invitations.length) {
        $committeeTableBody.innerHTML =
          `<tr><td colspan="5" class="text-center text-muted">Δεν έχουν σταλεί προσκλήσεις.</td></tr>`;
        committeeModal.show();
        return;
      }

      invitations.forEach(inv => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${inv.professorName}</td>
           <td><span class="badge ${getInviteResponseBootstrapBgClass(inv.response)}">
           ${Name.ofInvitationResponse(inv.response)}</span></td>
          <td>${fmtDateTime(inv.createdAt)}</td>
          <td>${fmtDateTime(inv.responseDate)}</td>`;
        $committeeTableBody.append(tr);
      });
    } catch {
      $committeeTableBody.innerHTML =
        `<tr><td colspan="5" class="text-danger">Σφάλμα φόρτωσης προσκεκλημένων μελών.</td></tr>`;
    }

    committeeModal.show();
  }

  loadTable();
})();
