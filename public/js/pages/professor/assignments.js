// /js/pages/professor/assignments.js (ultra simplified)
// Requires Bootstrap 5 and API helpers

(() => {
  // ---------- DOM refs ----------
  const $tbody = document.querySelector("#my-topics-table-body");

  // Assign modal
  const assignModal = new bootstrap.Modal(document.querySelector("#assign-student-modal"));
  const $assignForm = document.querySelector("#assign-student-form");
  const $assignTopicId = document.querySelector("#assign-topic-id");
  const $assignTopicTitle = document.querySelector("#assign-topic-title");
  const $studentSearch = document.querySelector("#studentSearch");

  // Unassign modal
  const confirmUnassignModal = new bootstrap.Modal(document.querySelector("#confirm-unassign-modal"));
  const $confirmUnassignTitle = document.querySelector("#confirm-unassign-title");
  const $confirmUnassignBtn = document.querySelector("#confirm-unassign-btn");

  // Committee modal
  const committeeModal = new bootstrap.Modal(document.querySelector("#committee-modal"));
  const $committeeTopicTitle = document.querySelector("#committee-topic-title");
  const $committeeTableBody = document.querySelector("#committee-table-body");

  // ---------- State ----------
  let selectedStudent = null;
  let currentThesisForUnassign = null;
  let $studentResultsList = null;

  // ---------- Helpers ----------
  function badge(text, theme = "secondary") {
    const b = document.createElement("span");
    b.className = `badge text-bg-${theme}`;
    b.textContent = text;
    return b;
  }

  function fmtDateTime(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(+d) ? "—"
      : new Intl.DateTimeFormat("el-GR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  }


  // ---------- Table ----------
  async function loadTable() {
    $tbody.innerHTML = "";

    try {
      const [topicsRes, thesesRes] = await Promise.all([getMyTopics(), getMyAssignedTopic()]);
      const topics = topicsRes?.data;
      const theses = thesesRes?.data;

      topics.forEach(t => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>
            <div class="fw-semibold">${t.title}</div>
            <div class="small text-muted">${t.summary ?? ""}</div>
          </td>
          <td>${badge("Μη ανατεθειμένο", "secondary").outerHTML}</td>
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
          <td>${badge("Προσωρινή ανάθεση", "warning").outerHTML}</td>
          <td>
            <div class="fw-semibold">${th.student}</div>
            <div class="small text-muted">ID Φοιτητή: ${th.studentId}</div>
          </td>
          <td class="text-center">
            <button class="btn btn-sm btn-outline-secondary me-2"><i class="bi bi-people me-1"></i> Προσκεκλημένα</button>
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

  // ---------- Assign ----------
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
    if (!selectedStudent) { alert("Παρακαλώ επιλέξτε φοιτητή από τη λίστα."); return; }
    const topicId = Number($assignTopicId.value);
    const submitBtn = $assignForm.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Ανάθεση...`;

    try {
      await assignTopic(selectedStudent.id, topicId);
      alert("Η ανάθεση καταχωρήθηκε προσωρινά.");
      assignModal.hide();
      await loadTable();
    } catch {
      alert("Αποτυχία ανάθεσης. Προσπαθήστε ξανά.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
  });

  // ---------- Unassign ----------
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
      alert("Η προσωρινή ανάθεση αναιρέθηκε.");
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

  // ---------- Committee ----------
  async function openCommitteeModal(thesis) {
    $committeeTopicTitle.textContent = thesis.topic || `Θέμα #${thesis.topicId}`;
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
          <td>#${inv.professorId}</td>
          <td>${
            inv.response === "accepted" ? badge("Αποδέχθηκε", "success").outerHTML :
            inv.response === "declined" ? badge("Απέρριψε", "danger").outerHTML :
            badge("Εκκρεμεί", "secondary").outerHTML
          }</td>
          <td>${fmtDateTime(inv.createdAt)}</td>
          <td>${fmtDateTime(inv.response === "accepted" ? inv.responseDate : null)}</td>
          <td>${fmtDateTime(inv.response === "declined" ? inv.responseDate : null)}</td>`;
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
