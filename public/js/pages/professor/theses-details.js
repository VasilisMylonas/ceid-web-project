function onDetailsButtonClick(event) {
  const thesisId = event.target.getAttribute("data-thesis-id");

  function renderBasicInfo(thesis) {
    document.getElementById("thesis-title").textContent = thesis.topic;
    document.getElementById("student-name").textContent = thesis.student || "—";

    const badge = document.getElementById("status-badge");
    badge.className = "badge " + getThesisStatusBootstrapBgClass(thesis.status);
    badge.textContent = Name.ofThesisStatus(thesis.status);

    const list = document.getElementById("committee-list");
    list.innerHTML = "";
    thesis.committeeMembers.forEach(member => {
      const li = document.createElement("li");
      li.textContent = `${member.name} (${member.role})`;
      list.appendChild(li);
    });
  }

  // Expects an array (timelineResponse.data)
  function renderTimeline(items) {
    const ul = document.getElementById("timeline-list");
    ul.innerHTML = "";
    items.forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      const oldL = Name.ofThesisStatus(item.oldStatus);
      const newL = Name.ofThesisStatus(item.newStatus);
      const when = fmtDateTime(item.changedAt);
      li.textContent = `Αλλαγή κατάστασης: ${oldL} → ${newL} (${when})`;
      ul.appendChild(li);
    });
  }

  async function renderActions(thesis) {
    const container = document.getElementById("actions-container");
    container.innerHTML = "";

    const status = String(thesis.status || "").toLowerCase();

    if (status === "under_assignment") {
      const h6 = document.createElement("h6");
      h6.textContent = "Προσκεκλημένα Μέλη";

      const ul = document.createElement("ul");
      ul.className = "list-group";

      const res = await getThesisInvitations(thesis.id);
      const invites = res?.data;

      invites.forEach(invite => {
        const li = document.createElement("li");
        li.className = "list-group-item";

        const statusRaw = String(invite.response || "pending").toLowerCase();
        const statusText = statusRaw === "accepted" ? "Αποδέχτηκε"
                        : statusRaw === "declined" ? "Απέρριψε"
                        : "Εκκρεμεί";
        const statusClass = statusRaw === "accepted" ? "text-success"
                          : statusRaw === "declined" ? "text-danger"
                          : "text-warning";

        li.innerHTML = `
          <div class="d-flex flex-column">
            <div>
              <strong>${invite.professorName || "—"}</strong>
              — <span class="${statusClass}">Κατάσταση πρόσκλησης: ${statusText}</span>
            </div>
            <small class="text-muted">
              Ημ/νία Πρόσκλησης: ${fmtDateTime(invite.createdAt)}
              • Ημ/νία απάντησης: ${fmtDateTime(invite.responseDate)}
            </small>
          </div>
        `;
        ul.appendChild(li);
      });

      const hr = document.createElement("hr");

      const btnCancel = document.createElement("button");
      btnCancel.className = "btn btn-danger mt-2";
      btnCancel.textContent = "Ακύρωση Ανάθεσης";
      btnCancel.addEventListener("click", async () => {
        btnCancel.disabled = true;
        btnCancel.textContent = "Ακύρωση...";
        await unassignTopic(thesis.id);
        // TODO: reload view/state after unassign
      });

      container.appendChild(h6);
      container.appendChild(ul);
      container.appendChild(hr);
      container.appendChild(btnCancel);
      return;
    }

    if (status === "active") {
        // ------- Header: Ιστορικό Σημειώσεων -------
        const h6History = document.createElement("h6");
        h6History.textContent = "Παλαιότερες Σημειώσεις";

        // container της λίστας
        const notesList = document.createElement("ul");
        notesList.className = "list-group mb-3";

        // προσωρινό "loading"
        const notesLoading = document.createElement("div");
        notesLoading.className = "text-muted mb-2";
        notesLoading.textContent = "Φόρτωση σημειώσεων...";

        // helper για render
        function renderNotesList(listEl, notes) {
            listEl.innerHTML = "";
            if (!notes || !notes.length) {
            const li = document.createElement("li");
            li.className = "list-group-item text-muted";
            li.textContent = "Δεν υπάρχουν σημειώσεις.";
            listEl.appendChild(li);
            return;
            }

            // Παλαιότερες -> Νεότερες
            notes.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

            notes.forEach(n => {
            const li = document.createElement("li");
            li.className = "list-group-item";

            const top = document.createElement("div");
            top.className = "d-flex justify-content-between align-items-center";

            const who = document.createElement("span");
            who.className = "fw-semibold";
            who.textContent = n.authorName || "Σημείωση";

            const when = document.createElement("small");
            when.className = "text-muted";
            when.textContent = fmtDateTime(n.createdAt);

            top.appendChild(who);
            top.appendChild(when);

            const body = document.createElement("p");
            body.className = "mb-0 mt-1";
            body.textContent = n.content || "";

            li.appendChild(top);
            li.appendChild(body);
            listEl.appendChild(li);
            });
        }

        // κάνε attach στο DOM πριν κάνεις fetch ώστε να φαίνεται το "Φόρτωση…"
        container.appendChild(h6History);
        container.appendChild(notesLoading);
        container.appendChild(notesList);

        // φέρε τις σημειώσεις
        try {
            const res = await getThesisNotes(thesis.id);
            const notes = res?.data;
            notesLoading.remove();
            renderNotesList(notesList, notes);
        } catch (err) {
            notesLoading.textContent = "Αποτυχία φόρτωσης σημειώσεων.";
        }

        // ------- Προσθήκη νέας σημείωσης -------
        const h6note = document.createElement("h6");
        h6note.textContent = "Προσθήκη Σημείωσης (Ορατή μόνο σε εσάς)";

        const textarea = document.createElement("textarea");
        textarea.className = "form-control mb-2";
        textarea.setAttribute("rows", "3");
        textarea.setAttribute("placeholder", "Γράψτε μια σημείωση... (max 300 χαρακτήρες)");

        const btnSave = document.createElement("button");
        btnSave.className = "btn btn-outline-primary mb-3";
        btnSave.textContent = "Αποθήκευση Σημείωσης";
        btnSave.addEventListener("click", async () => {
            const content = (textarea.value || "").slice(0, 300);
            if (!content.trim()) {
            alert("Παρακαλώ εισάγετε κείμενο σημείωσης.");
            return;
            }
            btnSave.disabled = true;
            btnSave.textContent = "Αποθήκευση...";
            const res = await postThesisNote(thesis.id, content);
            btnSave.disabled = false;
            btnSave.textContent = "Αποθήκευση Σημείωσης";

            if (res?.success) {
            textarea.value = "";
            // refresh notes μετά την αποθήκευση
            try {
                const notesRes2 = await getThesisNotes(thesis.id);
                const notes2 = Array.isArray(notesRes2) ? notesRes2 : (notesRes2?.data || []);
                renderNotesList(notesList, notes2);
            } catch {
                // ignore refresh error
            }
            alert("Η σημείωση αποθηκεύτηκε.");
            } else {
            alert("Αποτυχία αποθήκευσης.");
            }
        });

        const hr = document.createElement("hr");

        const h6act = document.createElement("h6");
        h6act.textContent = "Ενέργειες Επιβλέποντα";

        const btnMove = document.createElement("button");
        btnMove.className = "btn btn-primary";
        btnMove.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
        btnMove.addEventListener("click", async () => {
            btnMove.disabled = true;
            btnMove.textContent = "Ενημέρωση...";
            const res = await examineThesis(thesis.id);
            btnMove.disabled = false;
            btnMove.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
            if (res?.ok) {
            thesis.status = "under_examination";
            const badge = document.getElementById("status-badge");
            badge.className = "badge " + getThesisStatusBootstrapBgClass(thesis.status);
            badge.textContent = Name.ofThesisStatus(thesis.status);
            renderActions(thesis);
            alert('Η κατάσταση άλλαξε σε "Υπό Εξέταση".');
            }
        });

        // append τα υπόλοιπα controls κάτω από τη λίστα
        container.appendChild(h6note);
        container.appendChild(textarea);
        container.appendChild(btnSave);
        container.appendChild(hr);
        container.appendChild(h6act);
        container.appendChild(btnMove);
        return;
    }


if (status === "under_examination") {
  const btnView = document.createElement("a");
  btnView.className = "btn btn-secondary mb-2";
  btnView.textContent = "Προβολή Κειμένου Διπλωματικής";
  btnView.addEventListener("click", () => {
    const url = `${BASE_URL}/v1/theses/${thesis.id}/draft`;
    window.open(url, "_blank");
  });

  const btnAnnounce = document.createElement("button");
  btnAnnounce.className = "btn btn-info mb-2";
  btnAnnounce.textContent = "Δημιουργία Ανακοίνωσης Παρουσίασης";
  btnAnnounce.addEventListener("click", async () => {
    try {
      btnAnnounce.disabled = true;
      btnAnnounce.textContent = "Δημιουργία...";
      const res = await createDefenseAnnouncement(thesis.id);
      alert(res?.success ? "Η ανακοίνωση δημιουργήθηκε." : "Σφάλμα δημιουργίας.");
    } finally {
      btnAnnounce.disabled = false;
      btnAnnounce.textContent = "Δημιουργία Ανακοίνωσης Παρουσίασης";
    }
  });

  // Enable grading button (shown only when grading is disabled)
  const btnEnableGrading = document.createElement("button");
  btnEnableGrading.className = "btn btn-sm btn-outline-warning ms-2";
  btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";
  btnEnableGrading.addEventListener("click", async () => {
    btnEnableGrading.disabled = true;
    btnEnableGrading.textContent = "Ενεργοποίηση...";
    const res = await enableGrading(thesis.id, "enabled");
    if (res?.success) {
      thesis.grading = "enabled";
      alert("Η βαθμολόγηση της επιτροπής ενεργοποιήθηκε.");
      if (typeof renderActions === "function") return renderActions(thesis);
    } else {
      alert("Σφάλμα ενεργοποίησης.");
      btnEnableGrading.disabled = false;
      btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";
    }
  });

  // --- Grade form (shown only when grading enabled) ---
  const hr = document.createElement("hr");
  const h6grade = document.createElement("h6");
  h6grade.textContent = "Βαθμολόγηση";
  const p = document.createElement("p");
  p.textContent = "Εισάγετε ή δείτε τις βαθμολογίες της επιτροπής.";

  const form = document.createElement("form");
  form.className = "row g-2 mb-3";

  const makeNum = (id, label) => {
    const col = document.createElement("div");
    col.className = "col-12 col-md-6 col-lg-3";
    const lbl = document.createElement("label");
    lbl.className = "form-label mb-1";
    lbl.setAttribute("for", id);
    lbl.textContent = label;
    const input = document.createElement("input");
    input.type = "number";
    input.id = id;
    input.className = "form-control";
    input.min = "0"; input.max = "10"; input.step = "0.1";
    input.required = true;
    col.append(lbl, input);
    form.appendChild(col);
    return input;
  };

  const inpObjectives = makeNum("grade_objectives", "Στόχοι");
  const inpDuration = makeNum("grade_duration", "Διάρκεια");
  const inpDeliverable = makeNum("grade_deliverable", "Ποιότητα Παραδοτέου");
  const inpPresentation = makeNum("grade_presentation", "Ποιότητα Παρουσίασης");

  const btnGrade = document.createElement("button");
  btnGrade.className = "btn btn-success";
  btnGrade.textContent = "Εισαγωγή Βαθμολογίας";

  btnGrade.addEventListener("click", async (e) => {
    e.preventDefault();
    const toNum = (el) => Number(String(el.value).replace(",", "."));
    const ok = (n) => typeof n === "number" && !isNaN(n) && n >= 0 && n <= 10;

    const objectives = toNum(inpObjectives);
    const duration = toNum(inpDuration);
    const deliverableQuality = toNum(inpDeliverable);
    const presentationQuality = toNum(inpPresentation);

    if (![objectives, duration, deliverableQuality, presentationQuality].every(ok)) {
      return alert("Όλες οι βαθμολογίες πρέπει να είναι από 0 έως 10.");
    }

    try {
      btnGrade.disabled = true;
      btnGrade.textContent = "Αποστολή...";
      const res = await putGrade(thesis.id, objectives, duration, deliverableQuality, presentationQuality);
      alert(res?.success ? "Οι βαθμολογίες καταχωρήθηκαν." : "Σφάλμα καταχώρησης.");
    } finally {
      btnGrade.disabled = false;
      btnGrade.textContent = "Εισαγωγή Βαθμολογίας";
    }
  });

  if (thesis.grading =="disabled") {
    container.append(btnView, btnAnnounce, btnEnableGrading);
  } else {
    container.append(btnView, btnAnnounce, hr, h6grade, p, form, btnGrade);
  }
  return;
}


    if (status === "completed") {
      const p = document.createElement("p");
      p.innerHTML = `<strong>Τελική Βαθμολογία:</strong> ${thesis.grade || "—"}`;

      const linkRepo = document.createElement("a");
      linkRepo.className = "btn btn-link";
      linkRepo.textContent = "Link Αρχείου στο Αποθετήριο";
      linkRepo.href = `${thesis.nemertesLink || "—"}`;

      const linkForm = document.createElement("a");
      linkForm.className = "btn btn-link";
      linkForm.textContent = "Link Φόρμας Βαθμολόγησης";
      linkForm.href = `/praktiko?thesisId=${thesis.id}`;

      container.appendChild(p);
      container.appendChild(linkRepo);
      container.appendChild(linkForm);
      return;
    }else if (status === "cancelled") {
        container.innerHTML = `<div class="text-muted">Η διπλωματική είναι ακυρωμένη ,δεν υπάρχουν διαθέσιμες ενέργειες.</div>`;
    }
  }

  // -----------------------------
  // Init
  // -----------------------------
  async function init() {
    try {
      const [thesis, timelineResponse] = await Promise.all([
        getThesisDetails(thesisId),
        getThesisTimeline(thesisId),
      ]);

      renderBasicInfo(thesis.data);
      renderTimeline(timelineResponse.data);
      renderActions(thesis.data);
    } catch (e) {
      console.error(e);
      const actions = document.getElementById("actions-container");
      if (actions) {
        actions.innerHTML = `<div class="text-danger">Σφάλμα φόρτωσης δεδομένων.</div>`;
      }
    }
  }

  init();
}
