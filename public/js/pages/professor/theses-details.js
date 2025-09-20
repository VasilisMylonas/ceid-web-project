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
      li.textContent = `${member.name} (${Name.ofMemberRole(member.role)})`;
      list.appendChild(li);
    });
  }

  function renderTimeline(changes) {
    const ul = document.getElementById("timeline-list");
    ul.innerHTML = "";
    changes.forEach(change => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      const oldStatus = Name.ofThesisStatus(change.oldStatus);
      const newStatus = Name.ofThesisStatus(change.newStatus);
      const date = fmtDateTime(change.changedAt);
      li.textContent = `Αλλαγή κατάστασης: ${oldStatus} → ${newStatus} (${date})`;
      ul.appendChild(li);
    });
  }

  async function renderActions(thesis) {
    const container = document.getElementById("actions-container");
    container.innerHTML = "";

    const res = await getProfile();
    const myId = res.data.Professor.id;
    const isSupervisor = myId === thesis.supervisorId;

    const status = thesis.status;

    if (status === "under_assignment") {
      const h6 = document.createElement("h6");
      h6.textContent = "Προσκεκλημένα Μέλη";

      const ul = document.createElement("ul");
      ul.className = "list-group";

      const invRes = await getThesisInvitations(thesis.id);
      const invites = invRes?.data || [];

      invites.forEach(invite => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `
          <div class="d-flex flex-column">
            <div>
              <strong>${invite.professorName || "—"}</strong>
              — <span class="badge ${getInviteResponseBootstrapBgClass(invite.response)}">
                  Κατάσταση : ${Name.ofInvitationResponse(invite.response)}
                </span>
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
      
      if (!isSupervisor) {
        btnCancel.disabled = true;
        btnCancel.title = "Μόνο ο επιβλέπων μπορεί να ακυρώσει την ανάθεση.";
      }
      btnCancel.addEventListener("click", async () => {
        btnCancel.disabled = true;
        btnCancel.textContent = "Ακύρωση...";
        try {
          const res = await unassignTopic(thesis.id);
          if (res?.success) await loadDetails();
          else alert("Αποτυχία ακύρωσης.");
        } catch {
          alert("Σφάλμα ακύρωσης.");
        }
        btnCancel.disabled = false;
        btnCancel.textContent = "Ακύρωση Ανάθεσης";
      });

      container.append(h6, ul, hr, btnCancel);
      return;
    }

    if (status === "active") {
      const h6History = document.createElement("h6");
      h6History.textContent = "Παλαιότερες Σημειώσεις";

      const notesList = document.createElement("ul");
      notesList.className = "list-group mb-3";

      const notesLoading = document.createElement("div");
      notesLoading.className = "text-muted mb-2";
      notesLoading.textContent = "Φόρτωση σημειώσεων...";

      function renderNotesList(listEl, notes) {
        listEl.innerHTML = "";
        if (!notes || !notes.length) {
          const li = document.createElement("li");
          li.className = "list-group-item text-muted";
          li.textContent = "Δεν υπάρχουν σημειώσεις.";
          listEl.appendChild(li);
          return;
        }
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
          top.append(who, when);
          const body = document.createElement("p");
          body.className = "mb-0 mt-1";
          body.textContent = n.content || "";
          li.append(top, body);
          listEl.appendChild(li);
        });
      }

      container.append(h6History, notesLoading, notesList);

      try {
        const notesRes = await getThesisNotes(thesis.id);
        const notes = notesRes?.data;
        notesLoading.remove();
        renderNotesList(notesList, notes);
      } catch {
        notesLoading.textContent = "Αποτυχία φόρτωσης σημειώσεων.";
      }

      const h6note = document.createElement("h6");
      h6note.textContent = "Προσθήκη Σημείωσης (Ορατή μόνο σε εσάς)";

      const textarea = document.createElement("textarea");
      textarea.className = "form-control mb-2";
      textarea.rows = 3;
      textarea.placeholder = "Γράψτε μια σημείωση... (max 300 χαρακτήρες)";

      const btnSave = document.createElement("button");
      btnSave.className = "btn btn-outline-primary mb-3";
      btnSave.textContent = "Αποθήκευση Σημείωσης";
      btnSave.addEventListener("click", async () => {
        const content = (textarea.value || "").slice(0, 300).trim();
        if (!content) return alert("Παρακαλώ εισάγετε κείμενο σημείωσης.");

        btnSave.disabled = true;
        btnSave.textContent = "Αποθήκευση...";
        try {
          const res = await postThesisNote(thesis.id, content);
          if (res?.success) await loadDetails();
          else alert("Αποτυχία αποθήκευσης.");
        } catch {
          alert("Σφάλμα αποθήκευσης.");
        }
        btnSave.disabled = false;
        btnSave.textContent = "Αποθήκευση Σημείωσης";
      });

      const hr = document.createElement("hr");

      const h6act = document.createElement("h6");
      h6act.textContent = "Ενέργειες Επιβλέποντα";

      const btnExamine = document.createElement("button");
      btnExamine.className = "btn btn-primary";
      btnExamine.textContent = 'Αλλαγή σε "Υπό Εξέταση"';

      if (!isSupervisor || thesis.protocolNumber === null) {
        btnExamine.disabled = true;
      }
      btnExamine.addEventListener("click", async () => {
        btnExamine.disabled = true;
        btnExamine.textContent = "Ενημέρωση...";
        try {
          const res = await examineThesis(thesis.id);
          if (res?.success) await loadDetails();
          else alert("Αποτυχία αλλαγής κατάστασης.");
        } catch {
          alert("Σφάλμα αλλαγής κατάστασης.");
        }
        btnExamine.disabled = false;
        btnExamine.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
      });

      container.append(h6note, textarea, btnSave, hr, h6act, btnExamine);
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
      // Disable if not supervisor
      if (!isSupervisor) {
        btnAnnounce.disabled = true;
        btnAnnounce.title = "Μόνο ο επιβλέπων μπορεί να δημιουργήσει ανακοίνωση.";
      }
      btnAnnounce.addEventListener("click", async () => {
        btnAnnounce.disabled = true;
        btnAnnounce.textContent = "Δημιουργία...";
        try {
          const res = await createDefenseAnnouncement(thesis.id);
          if (res?.success) {
            alert("Η ανακοίνωση δημιουργήθηκε.");
            await loadDetails();
          } else {
            alert("Σφάλμα δημιουργίας.");
          }
        } catch {
          alert("Σφάλμα δημιουργίας.");
        }
        btnAnnounce.disabled = false;
        btnAnnounce.textContent = "Δημιουργία Ανακοίνωσης Παρουσίασης";
      });

      const btnEnableGrading = document.createElement("button");
      btnEnableGrading.className = "btn btn-sm btn-outline-warning ms-2";
      btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";

      if (!isSupervisor) {
        btnEnableGrading.disabled = true;
        btnEnableGrading.title = "Μόνο ο επιβλέπων μπορεί να ενεργοποιήσει τη βαθμολόγηση.";
      }
      btnEnableGrading.addEventListener("click", async () => {
        btnEnableGrading.disabled = true;
        btnEnableGrading.textContent = "Ενεργοποίηση...";
        try {
          const res = await enableGrading(thesis.id, "enabled");
          if (res?.success) {
            alert("Η βαθμολόγηση της επιτροπής ενεργοποιήθηκε.");
            await loadDetails();
          } else {
            alert("Σφάλμα ενεργοποίησης.");
            btnEnableGrading.disabled = false;
            btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";
          }
        } catch {
          alert("Σφάλμα ενεργοποίησης.");
          btnEnableGrading.disabled = false;
          btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";
        }
      });

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
        lbl.htmlFor = id;
        lbl.textContent = label;
        const input = document.createElement("input");
        input.type = "number"; input.id = id; input.className = "form-control";
        input.min = "0"; input.max = "10"; input.step = "0.1"; input.required = true;
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
        const toNum = el => Number(String(el.value).replace(",", "."));
        const ok = n => typeof n === "number" && !isNaN(n) && n >= 0 && n <= 10;

        const objectives = toNum(inpObjectives);
        const duration = toNum(inpDuration);
        const deliverableQuality = toNum(inpDeliverable);
        const presentationQuality = toNum(inpPresentation);

        if (![objectives, duration, deliverableQuality, presentationQuality].every(ok)) {
          return alert("Όλες οι βαθμολογίες πρέπει να είναι από 0 έως 10.");
        }

        btnGrade.disabled = true;
        btnGrade.textContent = "Αποστολή...";
        try {
          const res = await putGrade(thesis.id, objectives, duration, deliverableQuality, presentationQuality);
          if (res?.success) {
            alert("Οι βαθμολογίες καταχωρήθηκαν.");
            await loadDetails();
          } else {
            alert("Σφάλμα καταχώρησης.");
          }
        } catch {
          alert("Σφάλμα καταχώρησης.");
        }
        btnGrade.disabled = false;
        btnGrade.textContent = "Εισαγωγή Βαθμολογίας";
      });

      if (thesis.grading === "disabled") {
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
      linkRepo.href = `${thesis.nemertesLink || "#"}`;

      const linkForm = document.createElement("a");
      linkForm.className = "btn btn-link";
      linkForm.textContent = "Link Φόρμας Βαθμολόγησης";
      linkForm.href = `/praktiko?thesisId=${thesis.id}`;

      container.append(p, linkRepo, linkForm);
      return;
    } else if (status === "cancelled") {
      container.innerHTML = `<div class="text-muted">Η διπλωματική είναι ακυρωμένη ,δεν υπάρχουν διαθέσιμες ενέργειες.</div>`;
    }
  }

    function resetToEmpty() {
        const title = document.getElementById("thesis-title");
        const student = document.getElementById("student-name");
        const badge = document.getElementById("status-badge");
        const committee = document.getElementById("committee-list");
        const timeline = document.getElementById("timeline-list");
        const actions = document.getElementById("actions-container");

        if (title) title.textContent = "—";
        if (student) student.textContent = "—";
        if (badge) { badge.className = "badge bg-secondary"; badge.textContent = "—"; }
        if (committee) committee.innerHTML = "";
        if (timeline) timeline.innerHTML = "";
        if (actions) actions.innerHTML = "";
    }

  async function loadDetails() {
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
        resetToEmpty();
    }
  }

  loadDetails();
}
