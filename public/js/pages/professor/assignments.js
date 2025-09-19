// /js/pages/professor/assignments.js
// Depends on globally available API helpers:
// getMyTopics(), getMyAssignedTopic(), getUnassignedStudents(),
// assignTopic(studentId, topicId), unassignTopic(thesisId), getThesisInvitations(thesisId)
//
// Bootstrap 5 required for Modals.

(() => {
  // ---------- DOM ----------
  const $tbody = document.getElementById("my-topics-table-body");

  // Assign modal
  const $assignModalEl = document.getElementById("assign-student-modal");
  const assignModal = new bootstrap.Modal($assignModalEl);
  const $assignForm = document.getElementById("assign-student-form");
  const $assignTopicId = document.getElementById("assign-topic-id");
  const $assignTopicTitle = document.getElementById("assign-topic-title");
  const $studentSearch = document.getElementById("studentSearch");

  // Unassign modal
  const $confirmUnassignEl = document.getElementById("confirm-unassign-modal");
  const confirmUnassignModal = new bootstrap.Modal($confirmUnassignEl);
  const $confirmUnassignTitle = document.getElementById("confirm-unassign-title");
  const $confirmUnassignBtn = document.getElementById("confirm-unassign-btn");

  // Committee modal
  const $committeeModalEl = document.getElementById("committee-modal");
  const committeeModal = new bootstrap.Modal($committeeModalEl);
  const $committeeTopicTitle = document.getElementById("committee-topic-title");
  const $committeeTableBody = document.getElementById("committee-table-body");

  // ---------- Local state ----------
  let studentsCache = [];
  let selectedStudent = null;
  let $studentResultsList = null;
  let isLoadingTable = false;
  let currentThesisForUnassign = null;

  // ---------- Utils ----------
  const byId = (id) => document.getElementById(id);
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };

  const parseList = (res) =>
    Array.isArray(res?.data) ? res.data : (Array.isArray(res?.data?.data) ? res.data.data : []);

  const fmtDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return isNaN(d) ? "—" : new Intl.DateTimeFormat("el-GR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  };

  const badge = (text, theme = "secondary") => {
    const el = document.createElement("span");
    el.className = `badge text-bg-${theme}`;
    el.textContent = text;
    return el;
  };

  const toast = (msg, type = "success", ms = 2500) => {
    const el = document.createElement("div");
    el.className = `alert alert-${type} position-fixed top-0 end-0 m-3 shadow`;
    el.style.zIndex = 1080;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), ms);
  };

  const normalize = (s) =>
    (s || "").toString().trim().toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const matchesStudent = (s, q) => {
    const n = normalize(q);
    return normalize(s.am).includes(n) || normalize(s.name).includes(n);
  };

  const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  // ---------- Table ----------
  async function loadTable() {
    if (isLoadingTable) return;
    isLoadingTable = true;
    clear($tbody);

    try {
      const [topicsRes, thesesRes] = await Promise.all([getMyTopics(), getMyAssignedTopic()]);
      const topics = parseList(topicsRes);
      const theses = parseList(thesesRes);

      // Unassigned topics
      for (const t of topics) {
        const tr = document.createElement("tr");

        const tdTitle = document.createElement("td");
        tdTitle.innerHTML = `<div class="fw-semibold">${t.title}</div><div class="small text-muted">${t.summary ?? ""}</div>`;

        const tdStatus = document.createElement("td");
        tdStatus.appendChild(badge("Μη ανατεθειμένο", "secondary"));

        const tdStudent = document.createElement("td");
        tdStudent.textContent = "—";

        const tdActions = document.createElement("td");
        tdActions.className = "text-center";
        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-primary";
        btn.innerHTML = `<i class="bi bi-person-check me-1"></i> Ανάθεση`;
        btn.addEventListener("click", () => openAssignModal(t));
        tdActions.appendChild(btn);

        tr.append(tdTitle, tdStatus, tdStudent, tdActions);
        $tbody.appendChild(tr);
      }

      // Temporarily assigned (under_assignment)
      for (const th of theses) {
        const tr = document.createElement("tr");

        const tdTitle = document.createElement("td");
        tdTitle.innerHTML = `<div class="fw-semibold">${th.topic}</div><div class="small text-muted">ID #${th.topicId}</div>`;

        const tdStatus = document.createElement("td");
        tdStatus.appendChild(badge("Προσωρινή ανάθεση", "warning"));

        const tdStudent = document.createElement("td");
        tdStudent.innerHTML = `<div class="fw-semibold">${th.student}</div><div class="small text-muted">ID Φοιτητή: ${th.studentId}</div>`;

        const tdActions = document.createElement("td");
        tdActions.className = "text-center";

        const committeeBtn = document.createElement("button");
        committeeBtn.className = "btn btn-sm btn-outline-secondary me-2";
        committeeBtn.innerHTML = `<i class="bi bi-people me-1"></i> Προσκεκλημένα`;
        committeeBtn.addEventListener("click", () => openCommitteeModal(th));

        const unassignBtn = document.createElement("button");
        unassignBtn.className = "btn btn-sm btn-danger";
        unassignBtn.innerHTML = `<i class="bi bi-arrow-counterclockwise me-1"></i> Αναβολή`;
        unassignBtn.addEventListener("click", () => openUnassignModal(th));

        tdActions.append(committeeBtn, unassignBtn);
        tr.append(tdTitle, tdStatus, tdStudent, tdActions);
        $tbody.appendChild(tr);
      }

      if (!topics.length && !theses.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.className = "text-center text-muted py-4";
        td.textContent = "Δεν υπάρχουν διαθέσιμα θέματα ή προσωρινές αναθέσεις.";
        tr.appendChild(td);
        $tbody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 4;
      td.className = "text-danger";
      td.textContent = "Σφάλμα φόρτωσης δεδομένων.";
      tr.appendChild(td);
      $tbody.appendChild(tr);
    } finally {
      isLoadingTable = false;
    }
  }

  // ---------- Assign flow ----------
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
    clear(container);

    if (!list.length) {
      const empty = document.createElement("div");
      empty.className = "list-group-item text-muted";
      empty.textContent = "Δεν βρέθηκαν αποτελέσματα.";
      container.appendChild(empty);
      return;
    }

    for (const s of list.slice(0, 8)) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "list-group-item list-group-item-action d-flex justify-content-between align-items-center";
      item.innerHTML = `
        <div class="text-start">
          <div class="fw-semibold">${s.name}</div>
          <div class="small text-muted">Α.Μ.: ${s.am} · ${s.email ?? ""}</div>
        </div>
        <i class="bi bi-person-plus"></i>
      `;
      item.addEventListener("click", () => {
        selectedStudent = s;
        $studentSearch.value = `${s.am} — ${s.name}`;
        clear(container);
      });
      container.appendChild(item);
    }
  }

  async function openAssignModal(topic) {
    selectedStudent = null;
    $assignTopicId.value = topic.id;
    $assignTopicTitle.textContent = topic.title;
    $studentSearch.value = "";
    ensureStudentResultsList();
    clear($studentResultsList);

    if (!studentsCache.length) {
      try {
        const res = await getUnassignedStudents();
        studentsCache = parseList(res);
      } catch (e) {
        console.error(e);
        studentsCache = [];
      }
    }

    assignModal.show();
    $studentSearch.focus();
  }

  const onSearchInput = debounce(() => {
    const q = $studentSearch.value.trim();
    if (!q) {
      clear(ensureStudentResultsList());
      selectedStudent = null;
      return;
    }
    renderStudentResults(studentsCache.filter((s) => matchesStudent(s, q)));
  }, 200);

  $studentSearch.addEventListener("input", onSearchInput);

  $assignForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const topicId = Number($assignTopicId.value);

    if (!selectedStudent) {
      toast("Παρακαλώ επιλέξτε φοιτητή από τη λίστα.", "warning");
      return;
    }

    const submitBtn = $assignForm.querySelector('button[type="submit"]');
    const original = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Ανάθεση...`;

    try {
      await assignTopic(selectedStudent.id, topicId);
      toast("Η ανάθεση καταχωρήθηκε προσωρινά.", "success");
      assignModal.hide();
      await loadTable();
    } catch (err) {
      console.error(err);
      toast("Αποτυχία ανάθεσης. Προσπαθήστε ξανά.", "danger");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = original;
    }
  });

  $assignModalEl.addEventListener("hidden.bs.modal", () => {
    if ($studentResultsList) clear($studentResultsList);
    selectedStudent = null;
  });

  // ---------- Unassign flow ----------
  function openUnassignModal(thesis) {
    currentThesisForUnassign = thesis;
    $confirmUnassignTitle.textContent = thesis.topic || `Θέμα #${thesis.topicId}`;
    confirmUnassignModal.show();
  }

  $confirmUnassignBtn.addEventListener("click", async () => {
    if (!currentThesisForUnassign) return;
    const thesisId = currentThesisForUnassign.id;

    $confirmUnassignBtn.disabled = true;
    const original = $confirmUnassignBtn.textContent;
    $confirmUnassignBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2"></span>Αναίρεση...`;

    try {
      await unassignTopic(thesisId);
      toast("Η προσωρινή ανάθεση αναιρέθηκε.", "success");
      confirmUnassignModal.hide();
      currentThesisForUnassign = null;
      await loadTable();
    } catch (err) {
      console.error(err);
      toast("Αποτυχία αναβολής. Προσπαθήστε ξανά.", "danger");
    } finally {
      $confirmUnassignBtn.disabled = false;
      $confirmUnassignBtn.textContent = original;
    }
  });

  // ---------- Committee modal (view-only) ----------
  async function openCommitteeModal(thesis) {
    $committeeTopicTitle.textContent = thesis.topic || `Θέμα #${thesis.topicId}`;
    clear($committeeTableBody);

    try {
      const res = await getThesisInvitations(thesis.id);
      const invitations = parseList(res);

      if (!invitations.length) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 5;
        td.className = "text-center text-muted";
        td.textContent = "Δεν έχουν σταλεί προσκλήσεις.";
        tr.appendChild(td);
        $committeeTableBody.appendChild(tr);
      } else {
        for (const inv of invitations) {
          const tr = document.createElement("tr");

          const tdProf = document.createElement("td");
          tdProf.textContent = `#${inv.professorId}`;

          const tdStatus = document.createElement("td");
          const b = inv.response === "accepted"
            ? badge("Αποδέχθηκε", "success")
            : inv.response === "declined"
            ? badge("Απέρριψε", "danger")
            : badge("Εκκρεμεί", "secondary");
          tdStatus.appendChild(b);

          const tdInv = document.createElement("td");
          tdInv.textContent = fmtDateTime(inv.createdAt);

          const tdAcc = document.createElement("td");
          tdAcc.textContent = fmtDateTime(inv.response === "accepted" ? inv.responseDate : null);

          const tdRej = document.createElement("td");
          tdRej.textContent = fmtDateTime(inv.response === "declined" ? inv.responseDate : null);

          tr.append(tdProf, tdStatus, tdInv, tdAcc, tdRej);
          $committeeTableBody.appendChild(tr);
        }
      }
    } catch (err) {
      console.error(err);
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 5;
      td.className = "text-danger";
      td.textContent = "Σφάλμα φόρτωσης προσκεκλημένων μελών.";
      tr.appendChild(td);
      $committeeTableBody.appendChild(tr);
    }

    committeeModal.show();
  }

  // ---------- Init ----------
  loadTable();
})();
