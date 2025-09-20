const { default: professor } = require("src/models/professor");

function onDetailsButtonClick(event) {
  const thesisId = event.target.getAttribute("data-thesis-id");

 // Map API snake_case to badge classes; supports Title Case too
  function statusToBadgeClass(status) {
    const s = String(status || "").toLowerCase().replace(/\s+/g, "_");
    switch (s) {
      case "under_assignment": return "bg-warning text-dark";
      case "active": return "bg-primary";
      case "under_review": return "bg-info";
      case "completed": return "bg-success";
      default: return "bg-secondary";
    }
  }

  // API status (snake_case) -> Greek label
  function apiStatusToGrLabel(code) {
    const s = String(code || "").toLowerCase();
    switch (s) {
      case "under_assignment": return "Υπό Ανάθεση";
      case "active": return "Ενεργή";
      case "under_review": return "Υπό Εξέταση";
      case "completed": return "Ολοκληρωμένη";
      default: return code;
    }
  }

  // -----------------------------
  // Renderers
  // -----------------------------
  function renderBasicInfo(thesis) {
    document.getElementById("thesis-title").textContent = thesis.topic;
    document.getElementById("student-name").textContent = thesis.student || "—";

    const badge = document.getElementById("status-badge");
    badge.className = "badge " + statusToBadgeClass(thesis.status);
    badge.textContent = apiStatusToGrLabel(thesis.status);

    const list = document.getElementById("committee-list");
    list.innerHTML = "";
    (thesis.committeeMembers || []).forEach(member => {
      const li = document.createElement("li");
      li.textContent = `${member.name} (${member.role})`;
      list.appendChild(li);
    });
  }

  // Expects an array (timelineResponse.data)
  function renderTimeline(items) {
    const ul = document.getElementById("timeline-list");
    ul.innerHTML = "";
    (items || []).forEach(item => {
      const li = document.createElement("li");
      li.className = "list-group-item";
      const oldL = apiStatusToGrLabel(item.oldStatus);
      const newL = apiStatusToGrLabel(item.newStatus);
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
        const note = (textarea.value || "").slice(0, 300);
        btnSave.disabled = true;
        btnSave.textContent = "Αποθήκευση...";
        // Replace with your real endpoint
        const res = await savePrivateNote(thesis.id, note);
        btnSave.disabled = false;
        btnSave.textContent = "Αποθήκευση Σημείωσης";
        alert(res?.ok ? "Η σημείωση αποθηκεύτηκε." : "Αποτυχία αποθήκευσης.");
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
        // Replace with real endpoint
        const res = await moveToUnderReview(thesis.id);
        btnMove.disabled = false;
        btnMove.textContent = 'Αλλαγή σε "Υπό Εξέταση"';
        if (res?.ok) {
          thesis.status = "under_review";
          const badge = document.getElementById("status-badge");
          badge.className = "badge " + statusToBadgeClass(thesis.status);
          badge.textContent = apiStatusToGrLabel(thesis.status);
          renderActions(thesis);
          alert('Η κατάσταση άλλαξε σε "Υπό Εξέταση".');
        }
      });

      container.appendChild(h6note);
      container.appendChild(textarea);
      container.appendChild(btnSave);
      container.appendChild(hr);
      container.appendChild(h6act);
      container.appendChild(btnMove);
      return;
    }

    if (status === "under_review") {
      const btnView = document.createElement("a");
      btnView.className = "btn btn-secondary mb-2";
      btnView.textContent = "Προβολή Κειμένου Διπλωματικής";
      btnView.href = "#";

      const btnAnnounce = document.createElement("button");
      btnAnnounce.className = "btn btn-info mb-2";
      btnAnnounce.textContent = "Δημιουργία Ανακοίνωσης Παρουσίασης";
      btnAnnounce.addEventListener("click", async () => {
        btnAnnounce.disabled = true;
        btnAnnounce.textContent = "Δημιουργία...";
        // Replace with real endpoint
        const res = await createDefenseAnnouncement(thesis.id);
        btnAnnounce.disabled = false;
        btnAnnounce.textContent = "Δημιουργία Ανακοίνωσης Παρουσίασης";
        if (res?.ok) alert("Η ανακοίνωση δημιουργήθηκε.");
      });

      const hr = document.createElement("hr");

      const h6grade = document.createElement("h6");
      h6grade.textContent = "Βαθμολόγηση";

      const p = document.createElement("p");
      p.textContent = "Εισάγετε ή δείτε τις βαθμολογίες της επιτροπής.";

      const btnGrade = document.createElement("button");
      btnGrade.className = "btn btn-success";
      btnGrade.textContent = "Εισαγωγή Βαθμολογίας";
      btnGrade.addEventListener("click", async () => {
        const payload = {
          committeeGrades: (thesis.committeeMembers || []).slice(0, 3).map((m, i) => ({
            member: m.name,
            grade: [8.5, 9.0, 8.0][i] || 8.0,
          })),
        };
        btnGrade.disabled = true;
        btnGrade.textContent = "Αποστολή...";
        // Replace with real endpoint
        const res = await enterGrade(thesis.id, payload);
        btnGrade.disabled = false;
        btnGrade.textContent = "Εισαγωγή Βαθμολογίας";
        alert(res?.ok ? "Οι βαθμολογίες καταχωρήθηκαν." : "Σφάλμα καταχώρησης.");
      });

      container.appendChild(btnView);
      container.appendChild(btnAnnounce);
      container.appendChild(hr);
      container.appendChild(h6grade);
      container.appendChild(p);
      container.appendChild(btnGrade);
      return;
    }

    if (status === "completed") {
      const p = document.createElement("p");
      p.innerHTML = `<strong>Τελική Βαθμολογία:</strong> 8.5`;

      const linkRepo = document.createElement("a");
      linkRepo.className = "btn btn-link";
      linkRepo.textContent = "Link Αρχείου στο Αποθετήριο";
      linkRepo.href = "#";

      const linkForm = document.createElement("a");
      linkForm.className = "btn btn-link";
      linkForm.textContent = "Link Φόρμας Βαθμολόγησης";
      linkForm.href = "#";

      container.appendChild(p);
      container.appendChild(linkRepo);
      container.appendChild(linkForm);
      return;
    }

    // Fallback
    const empty = document.createElement("div");
    empty.className = "text-muted";
    empty.textContent = "Δεν υπάρχουν διαθέσιμες ενέργειες για αυτήν την κατάσταση.";
    container.appendChild(empty);
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
