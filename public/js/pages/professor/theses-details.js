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

  container.append(h6History, notesLoading, notesList);

  const notesRes = await getThesisNotes(thesis.id);
  const notes = notesRes?.data ;
  notesLoading.remove();

  if (!notes.length) {
    const li = document.createElement("li");
    li.className = "list-group-item text-muted";
    li.textContent = "Δεν υπάρχουν σημειώσεις.";
    notesList.append(li);
  } else {
    notes.forEach(n => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      li.innerHTML = `
        <div class="d-flex justify-content-between align-items-center">
          <span class="fw-semibold">${n.authorName || "Σημείωση"}</span>
          <small class="text-muted">${fmtDateTime(n.createdAt)}</small>
        </div>
        <p class="mb-0 mt-1">${n.content || ""}</p>
      `;
      notesList.append(li);
    });
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

    const res = await postThesisNote(thesis.id, content);
    if (res?.success) await loadDetails();
    else alert("Αποτυχία αποθήκευσης.");

    btnSave.disabled = false;
    btnSave.textContent = "Αποθήκευση Σημείωσης";
  });

  const hr = document.createElement("hr");
  const h6act = document.createElement("h6");
  h6act.textContent = "Ενέργειες Επιβλέποντα";

  const btnExamine = document.createElement("button");
  btnExamine.className = "btn btn-primary";
  btnExamine.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
  btnExamine.disabled = !isSupervisor || thesis.protocolNumber == null;

  btnExamine.addEventListener("click", async () => {
    btnExamine.disabled = true;
    btnExamine.textContent = "Ενημέρωση...";
    const res = await examineThesis(thesis.id);
    if (res?.success) await loadDetails();
    else alert("Αποτυχία αλλαγής κατάστασης.");
    btnExamine.disabled = false;
    btnExamine.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
  });

  const twoYearsPassed = thesis.startDate
    ? (new Date() >= new Date(new Date(thesis.startDate).setFullYear(new Date(thesis.startDate).getFullYear() + 2)))
    : false;

  const actionRow = document.createElement("div");
  actionRow.className = "d-flex gap-2 flex-wrap align-items-start";

  actionRow.append(btnExamine);

  if (isSupervisor && twoYearsPassed) {
    const formGroup = document.createElement("div");
    formGroup.className = "input-group";

    const lbl = document.createElement("span");
    lbl.className = "input-group-text";
    lbl.textContent = "Αριθμός Πρακτικού";

    const assemblyInput = document.createElement("input");
    assemblyInput.type = "text";
    assemblyInput.className = "form-control";
    assemblyInput.placeholder = "π.χ. 123/2025";

    const btnCancelThesis = document.createElement("button");
    btnCancelThesis.className = "btn btn-outline-danger";
    btnCancelThesis.textContent = "Ακύρωση Διπλωματικής";
    btnCancelThesis.disabled = true; 

    assemblyInput.addEventListener("input", () => {
      btnCancelThesis.disabled = !assemblyInput.value.trim();
    });

    btnCancelThesis.addEventListener("click", async () => {
      const assemblyNumber = assemblyInput.value.trim();
      if (!assemblyNumber) return alert("Συμπληρώστε τον αριθμό και το έτος της Γενικής Συνέλευσης.");
      if (!confirm("Σίγουρα θέλετε να ακυρώσετε τη διπλωματική;")) return;

      btnCancelThesis.disabled = true;
      btnCancelThesis.textContent = "Ακύρωση...";
      const res = await cancelThesis(
        thesis.id,
        assemblyNumber,
        "Διπλωματική ακυρώθηκε μετά από 2 έτη χωρίς ολοκλήρωση"
      );
      if (res?.success) await loadDetails();
      else {
        alert("Αποτυχία ακύρωσης.");
        btnCancelThesis.disabled = false;
        btnCancelThesis.textContent = "Ακύρωση Διπλωματικής";
      }
    });

    formGroup.append(lbl, assemblyInput, btnCancelThesis);
    actionRow.append(formGroup);
  }

  container.append(h6note, textarea, btnSave, hr, h6act, actionRow);
  return;
}


    if (status === "under_examination") {
    // --- Top action bar ---
    const btnBar = document.createElement("div");
    btnBar.className = "d-flex gap-2 flex-wrap mb-3";

    const btnView = document.createElement("button");
    btnView.className = "btn btn-outline-secondary";
    btnView.textContent = "Προβολή Κειμένου Διπλωματικής";
    btnView.addEventListener("click", () => {
        window.open(`${BASE_URL}/v1/theses/${thesis.id}/draft`, "_blank");
    });

    const btnEnableGrading = document.createElement("button");
    btnEnableGrading.className = "btn btn-outline-warning";
    btnEnableGrading.textContent = "Ενεργοποίηση Βαθμολόγησης";
    if (!isSupervisor) {
        btnEnableGrading.disabled = true;
        btnEnableGrading.title = "Μόνο ο επιβλέπων μπορεί να ενεργοποιήσει τη βαθμολόγηση.";
    }
    btnEnableGrading.addEventListener("click", async () => {
        const originalLabel = "Ενεργοποίηση Βαθμολόγησης";
        btnEnableGrading.disabled = true;
        btnEnableGrading.textContent = "Ενεργοποίηση...";

        try {
            const res = await enableGrading(thesis.id, "enabled")
            await loadDetails(); 
            
        } catch (err) {
            console.error(err);
            alert("Για την ενεργοποιήση της βαθμολόγησης απαιτείται η καταχύρωση ανακοίνωσης.");
        }
        btnEnableGrading.disabled = false;
        btnEnableGrading.textContent = originalLabel;
    });


    btnBar.append(btnView, btnEnableGrading);
    container.append(btnBar);

    if (isSupervisor) {
    const h6Ann = document.createElement("h6");
    h6Ann.textContent = "Ανακοίνωση Παρουσίασης";

    const annWrap = document.createElement("div");
    annWrap.className = "mb-3";

    const annTextarea = document.createElement("textarea");
    annTextarea.className = "form-control mb-2";
    annTextarea.rows = 4;
    annTextarea.placeholder = "Κείμενο ανακοίνωσης (ημερομηνία, χώρος, ώρα κ.λπ.)";

    const btnSaveAnn = document.createElement("button");
    btnSaveAnn.className = "btn btn-outline-info";
    btnSaveAnn.textContent = "Αποθήκευση Ανακοίνωσης";

    container.append(h6Ann, annWrap);
    annWrap.append(annTextarea, btnSaveAnn);

    (async () => {
        try {
        const announcementRes = await getAnnouncement(thesis.id);

        if (announcementRes?.success) {
            annTextarea.value = announcementRes?.data?.content || "";
        } else if (announcementRes?.status && announcementRes.status !== 404) {
            console.warn("Announcement load returned non-ok status:", announcementRes.status);
        }
        } catch (err) {
        console.error("Failed to load announcement:", err);

        }
    })();

    btnSaveAnn.addEventListener("click", async () => {
        const text = (annTextarea.value || "").trim();
        const originalLabel = "Αποθήκευση Ανακοίνωσης";

        btnSaveAnn.disabled = true;
        btnSaveAnn.textContent = "Αποθήκευση...";

        try {
        const res = await announceThesis(thesis.id, text);
            if (res?.success) {
                alert("Η ανακοίνωση αποθηκεύτηκε.");
                await loadDetails(); 
                return;
            }
        } catch (err) {
        console.error(err);
        alert("Η επιλογή αυτή είναι ενεργή μόνο εφόσον ο φοιτητής έχει συμπληρώσει τις σχετικές λεπτομέρειες της παρουσίασης");
        }


        btnSaveAnn.disabled = false;
        btnSaveAnn.textContent = originalLabel;
    });
    }
    
    if (thesis.grading === "disabled") return;

    const hr = document.createElement("hr");
    const h6grade = document.createElement("h6");
    h6grade.textContent = "Βαθμολόγηση";
    const p = document.createElement("p");
    p.textContent = "Εισάγετε τις βαθμολογίες σας (0–10).";

    const form = document.createElement("form");
    form.className = "row g-2 mb-3";

    const mkNum = (id, label) => {
        const col = document.createElement("div");
        col.className = "col-12 col-md-6 col-lg-3";
        col.innerHTML = `
        <label class="form-label mb-1" for="${id}">${label}</label>
        <input id="${id}" type="number" class="form-control" min="0" max="10" step="0.1" required />
        `;
        form.appendChild(col);
        return () => Number(String(document.getElementById(id).value).replace(",", "."));
    };

    const getObjectives   = mkNum("grade_objectives",   "Στόχοι");
    const getDuration     = mkNum("grade_duration",     "Διάρκεια");
    const getDeliverable  = mkNum("grade_deliverable",  "Ποιότητα Παραδοτέου");
    const getPresentation = mkNum("grade_presentation", "Ποιότητα Παρουσίασης");

    const btnGrade = document.createElement("button");
    btnGrade.className = "btn btn-success";
    btnGrade.textContent = "Εισαγωγή Βαθμολογίας";
    btnGrade.addEventListener("click", async (e) => {
        e.preventDefault();
        const vals = [getObjectives(), getDuration(), getDeliverable(), getPresentation()];
        btnGrade.disabled = true; btnGrade.textContent = "Αποστολή...";
        const res = await putGrade(thesis.id, ...vals);
        if (res?.success) { alert("Οι βαθμολογίες καταχωρήθηκαν."); await loadDetails(); }
        else { alert("Σφάλμα καταχώρησης."); btnGrade.disabled = false; btnGrade.textContent = "Εισαγωγή Βαθμολογίας"; }
    });

    container.append(hr, h6grade, p, form, btnGrade);

    // --- Πίνακας βαθμολογιών όλων (ορατός σε όλους) ---
    const gradesTitle = document.createElement("h6");
    gradesTitle.textContent = "Βαθμολογίες Όλων των Καθηγητών";

    const gradesWrap = document.createElement("div");
    const result = await getGrades(thesis.id); 
    const grades = result?.data || [];

    if (!grades.length) {
        const empty = document.createElement("div");
        empty.className = "text-muted";
        empty.textContent = "Δεν υπάρχουν υποβληθείσες βαθμολογίες.";
        gradesWrap.append(empty);
    } else {
        const table = document.createElement("table");
        table.className = "table table-sm align-middle";
        table.innerHTML = `
        <thead>
            <tr>
            <th>Καθηγητής</th>
            <th>Στόχοι</th>
            <th>Διάρκεια</th>
            <th>Ποιότητα Παραδοτέου</th>
            <th>Ποιότητα Παρουσίασης</th>
            <th>Υποβλήθηκε</th>
            </tr>
        </thead>
        <tbody></tbody>
        `;
        const tbody = table.querySelector("tbody");
        grades.forEach(g => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${g.professor || "—"}</td>
            <td>${g.objectives ?? "—"}</td>
            <td>${g.duration ?? "—"}</td>
            <td>${g.deliverableQuality ?? "—"}</td>
            <td>${g.presentationQuality ?? "—"}</td>
            <td>${fmtDateTime(g.updatedAt)}</td>
        `;
        tbody.appendChild(tr);
        });
        gradesWrap.append(table);
    }

    container.append(gradesTitle, gradesWrap);
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
      linkForm.textContent = "Πρακτίκο Βαθμολόγησης";
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
