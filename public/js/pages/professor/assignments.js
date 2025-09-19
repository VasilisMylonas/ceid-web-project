// /js/pages/professor/assignments.js
// Requires Bootstrap 5 and the global API helpers:
// getMyTopics(), getMyAssignedTopic(), getUnassignedStudents(),
// assignTopic(studentId, topicId), unassignTopic(thesisId), getThesisInvitations(thesisId)

(() => {
  // ---------- Helpers ----------
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => document.querySelectorAll(sel);
  const clear = (el) => { while (el.firstChild) el.removeChild(el.firstChild); };
  const el = (tag, opts = {}) => Object.assign(document.createElement(tag), opts);

  const fmtDateTime = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    return Number.isNaN(+d)
      ? "—"
      : new Intl.DateTimeFormat("el-GR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  };

  const badge = (text, theme = "secondary") => {
    const b = el("span");
    b.className = `badge text-bg-${theme}`;
    b.textContent = text;
    return b;
  };

  const toast = (msg, type = "success", ms = 2500) => {
    const t = el("div", {
      className: `alert alert-${type} position-fixed top-0 end-0 m-3 shadow`,
      textContent: msg,
    });
    t.style.zIndex = 1080;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), ms);
  };

  const normalize = (s) =>
    (s ?? "").toString().trim().toLowerCase()
      .normalize("NFD").replace(/\p{Diacritic}/gu, "");

  const matchesStudent = (student, q) => {
    const n = normalize(q);
    return normalize(student.am).includes(n) || normalize(student.name).includes(n);
  };

  const parseList = (res) =>
    Array.isArray(res?.data) ? res.data :
    (Array.isArray(res?.data?.data) ? res.data.data : []);

  const debounce = (fn, ms = 300) => {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };

  // ---------- DOM ----------
  const $tbody = $("#my-topics-table-body");

  // Assign modal
  const $assignModalEl = $("#assign-student-modal");
  const assignModal = new bootstrap.Modal($assignModalEl);
  const $assignForm = $("#assign-student-form");
  const $assignTopicId = $("#assign-topic-id");
  const $assignTopicTitle = $("#assign-topic-title");
  const $studentSearch = $("#studentSearch");

  // Unassign modal
  const $confirmUnassignEl = $("#confirm-unassign-modal");
  const confirmUnassignModal = new bootstrap.Modal($confirmUnassignEl);
  const $confirmUnassignTitle = $("#confirm-unassign-title");
  const $confirmUnassignBtn = $("#confirm-unassign-btn");

  // Committee modal
  const $committeeModalEl = $("#committee-modal");
  const committeeModal = new bootstrap.Modal($committeeModalEl);
  const $committeeTopicTitle = $("#committee-topic-title");
  const $committeeTableBody = $("#committee-table-body");

  // Local state (lean)
  let selectedStudent = null;
  let currentThesisForUnassign = null;
  let $studentResultsList = null;
  let isLoadingTable = false;

  // ---------- Table ----------
  async function loadTable() {
    if (isLoadingTable) return;
    isLoadingTable = true;
    clear($tbody);

    try {
      const [topicsRes, thesesRes] = await Promise.all([
        getMyTopics(),
        getMyAssignedTopic()
      ]);
      const topics = parseList(topicsRes);
      const theses = parseList(thesesRes);

      // Unassigned topics
      for (const t of topics) {
        const tr = el("tr");

        const tdTitle = el("td");
        const titleWrap = el("div", { className: "fw-semibold" });
        titleWrap.textContent = t.title;
        const sub = el("div", { className: "small text-muted" });
        sub.textContent = t.summary ?? "";
        tdTitle.append(titleWrap, sub);

        const tdStatus = el("td"); tdStatus.append(badge("Μη ανατεθειμένο", "secondary"));
        const tdStudent = el("td", { textContent: "—" });

        const tdActions = el("td"); tdActions.className = "text-center";
        const btn = el("button", { className: "btn btn-sm btn-primary", type: "button" });
        btn.innerHTML = `<i class="bi bi-person-check me-1"></i> Ανάθεση`;
        btn.addEventListener("click", () => openAssignModal(t));
        tdActions.append(btn);

        tr.append(tdTitle, tdStatus, tdStudent, tdActions);
        $tbody.appendChild(tr);
      }

      // Temporarily assigned
      for (const th of theses) {
        const tr = el("tr");

        const tdTitle = el("td");
        const titleWrap = el("div", { className: "fw-semibold" }); titleWrap.textContent = th.topic;
        const sub = el("div", { className: "small text-muted" }); sub.textContent = `ID #${th.topicId}`;
        tdTitle.append(titleWrap, sub);

        const tdStatus = el("td"); tdStatus.append(badge("Προσωρινή ανάθεση", "warning"));

        const tdStudent = el("td");
        const stName = el("div", { className: "fw-semibold" }); stName.textContent = th.student;
        const stSub = el("div", { className: "small text-muted" }); stSub.textContent = `ID Φοιτητή: ${th.studentId}`;
        tdStudent.append(stName, stSub);

        const tdActions = el("td"); tdActions.className = "text-center";

        const committeeBtn = el("button", { className: "btn btn-sm btn-outline-secondary me-2", type: "button" });
        committeeBtn.innerHTML = `<i class="bi bi-people me-1"></i> Προσκεκλημένα`;
        committeeBtn.addEventListener("click", () => openCommitteeModal(th));

        const unassignBtn = el("button", { className: "btn btn-sm btn-danger", type: "button" });
        unassignBtn.innerHTML = `<i class="bi bi-arrow-counterclockwise me-1"></i> Αναβολή`;
        unassignBtn.addEventListener("click", () => openUnassignModal(th));

        tdActions.append(committeeBtn, unassignBtn);
        tr.append(tdTitle, tdStatus, tdStudent, tdActions);
        $tbody.appendChild(tr);
      }

      if (!topics.length && !theses.length) {
        const tr = el("tr");
        const td = el("td", {
          colSpan: 4,
          className: "text-center text-muted py-4",
          textContent: "Δεν υπάρχουν διαθέσιμα θέματα ή προσωρινές αναθέσεις.",
        });
        tr.appendChild(td);
        $tbody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      const tr = el("tr");
      const td = el("td", {
        colSpan: 4,
        className: "text-danger",
        textContent: "Σφάλμα φόρτωσης δεδομένων.",
      });
      tr.appendChild(td);
      $tbody.appendChild(tr);
    } finally {
      isLoadingTable = false;
    }
  }

  // ---------- Assign flow ----------
  function ensureStudentResultsList() {
    if ($studentResultsList && document.body.contains($studentResultsList)) return $studentResultsList;
    $studentResultsList = el("div", { id: "studentResults", className: "list-group mt-2" });
    $studentSearch.insertAdjacentElement("afterend", $studentResultsList);
    return $studentResultsList;
  }

  function renderStudentResults(list) {
    const container = ensureStudentResultsList();
    clear(container);

    if (!list.length) {
      container.appendChild(el("div", {
        className: "list-group-item text-muted",
        textContent: "Δεν βρέθηκαν αποτελέσματα."
      }));
      return;
    }

    for (const s of list.slice(0, 8)) {
      const item = el("button", { type: "button", className: "list-group-item list-group-item-action d-flex justify-content-between align-items-center" });
      const left = el("div", { className: "text-start" });
      const nm = el("div", { className: "fw-semibold", textContent: s.name });
      const small = el("div", { className: "small text-muted", textContent: `Α.Μ.: ${s.am}${s.email ? ` · ${s.email}` : ""}` });
      left.append(nm, small);

      const icon = el("i"); icon.className = "bi bi-person-plus";
      item.append(left, icon);

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
    $assignTopicId.value = String(topic.id);
    $assignTopicTitle.textContent = topic.title;
    $studentSearch.value = "";
    ensureStudentResultsList();
    clear($studentResultsList);

    assignModal.show();
    // Focus after modal fully shown for better UX
    setTimeout(() => $studentSearch.focus(), 200);
  }

  // No caching: every keystroke (debounced) fetches fresh data and filters locally
  const onSearchInput = debounce(async () => {
    const q = $studentSearch.value.trim();
    const container = ensureStudentResultsList();
    if (!q) {
      clear(container);
      selectedStudent = null;
      return;
    }

    // Show lightweight loading state
    clear(container);
    container.appendChild(el("div", { className: "list-group-item", textContent: "Αναζήτηση..." }));

    try {
      const res = await getUnassignedStudents();      // fresh every time
      const students = parseList(res);
      const filtered = students.filter((s) => matchesStudent(s, q));
      renderStudentResults(filtered);
    } catch (e) {
      console.error(e);
      clear(container);
      container.appendChild(el("div", { className: "list-group-item text-danger", textContent: "Σφάλμα αναζήτησης." }));
    }
  }, 250);

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
    const original = $confirmUnassignBtn.textContent;
    $confirmUnassignBtn.disabled = true;
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

  // ---------- Committee (view-only) ----------
  async function openCommitteeModal(thesis) {
    $committeeTopicTitle.textContent = thesis.topic || `Θέμα #${thesis.topicId}`;
    clear($committeeTableBody);

    try {
      const res = await getThesisInvitations(thesis.id);
      const invitations = parseList(res);

      if (!invitations.length) {
        const tr = el("tr");
        const td = el("td", {
          colSpan: 5, className: "text-center text-muted",
          textContent: "Δεν έχουν σταλεί προσκλήσεις."
        });
        tr.appendChild(td);
        $committeeTableBody.appendChild(tr);
        committeeModal.show();
        return;
      }

      for (const inv of invitations) {
        const tr = el("tr");

        const tdProf = el("td", { textContent: `#${inv.professorId}` });

        const tdStatus = el("td");
        tdStatus.append(
          inv.response === "accepted" ? badge("Αποδέχθηκε", "success") :
          inv.response === "declined" ? badge("Απέρριψε", "danger") :
          badge("Εκκρεμεί", "secondary")
        );

        const tdInv = el("td", { textContent: fmtDateTime(inv.createdAt) });
        const tdAcc = el("td", { textContent: fmtDateTime(inv.response === "accepted" ? inv.responseDate : null) });
        const tdRej = el("td", { textContent: fmtDateTime(inv.response === "declined" ? inv.responseDate : null) });

        tr.append(tdProf, tdStatus, tdInv, tdAcc, tdRej);
        $committeeTableBody.appendChild(tr);
      }
    } catch (err) {
      console.error(err);
      const tr = el("tr");
      const td = el("td", { colSpan: 5, className: "text-danger", textContent: "Σφάλμα φόρτωσης προσκεκλημένων μελών." });
      tr.appendChild(td);
      $committeeTableBody.appendChild(tr);
    }

    committeeModal.show();
  }

  // ---------- Init ----------
  loadTable();
})();
