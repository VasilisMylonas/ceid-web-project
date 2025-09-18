document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".container-fluid.py-4");
  const stateAssignment = document.getElementById("state-assignment");
  const stateExamination = document.getElementById("state-examination");
  const stateCompleted = document.getElementById("state-completed");
  const modalElement = document.getElementById("invite-modal");

  let currentThesis; // This will be the single source of truth for thesis data.
  let initialThesisId;

  const hideAllStates = () => {
    if (stateAssignment) stateAssignment.style.display = "none";
    if (stateExamination) stateExamination.style.display = "none";
    if (stateCompleted) stateCompleted.style.display = "none";
  };

  /**
   * Fetches all necessary data from the server and updates the entire UI.
   * This is the single source of truth for rendering the page state.
   */
  const refreshPageData = async () => {
    if (!initialThesisId) return;
    try {
      const thesisDetailsResponse = await getThesisDetails(initialThesisId);
      currentThesis = thesisDetailsResponse.data;

      // --- Check for preliminary or terminal statuses ---
      const preliminaryStatuses = {
        pending: "Η αίτησή σας για τη διπλωματική εργασία εκκρεμεί για έγκριση από την γραμματεία.",
        rejected: "Η αίτησή σας για τη διπλωματική εργασία απορρίφθηκε. Παρακαλώ επικοινωνήστε με την γραμματεία για περισσότερες πληροφορίες.",
        active: "Η διπλωματική σας εργασία έχει εγκριθεί και είναι σε κατάσταση ενεργή.",
        cancelled: "Η διπλωματική εργασία έχει ακυρωθεί.",
      };

      if (Object.keys(preliminaryStatuses).includes(currentThesis.status)) {
        container.innerHTML = `
          <div class="alert alert-info text-center">
              <h3>Ενημέρωση Κατάστασης</h3>
              <p class="lead">${preliminaryStatuses[currentThesis.status]}</p>
          </div>`;
        return;
      }

      let activeStateCard = null;
      switch (currentThesis.status) {
        case "under_assignment": activeStateCard = stateAssignment; break;
        case "under_examination": activeStateCard = stateExamination; break;
        case "completed": activeStateCard = stateCompleted; break;
        default: activeStateCard = stateAssignment; break;
      }

      hideAllStates();
      if (activeStateCard) {
        activeStateCard.style.display = "block";
        populateCommitteeList(currentThesis, activeStateCard);

        if (currentThesis.status === "under_assignment") {
          const invitationsResponse = await getThesisInvitations(currentThesis.id);
          populateInvitationsList(invitationsResponse.data || [], activeStateCard);
        } else if (currentThesis.status === "under_examination") {
          await populateExaminationState(currentThesis);
        }
      }
    } catch (error) {
      console.error("Failed to refresh page data:", error);
      container.innerHTML = '<div class="alert alert-danger">Σφάλμα ανανέωσης δεδομένων σελίδας.</div>';
    }
  };

  // --- INITIAL PAGE LOAD ---
  try {
    const thesisSummaryResponse = await getThesis();
    if (!thesisSummaryResponse?.data?.length) {
      container.innerHTML = '<div class="alert alert-warning text-center"><h3>Δεν έχετε αναλάβει κάποια διπλωματική εργασία.</h3></div>';
      return;
    }
    initialThesisId = thesisSummaryResponse.data[0].id;
  } catch (error) {
    console.error("Failed to fetch initial thesis data:", error);
    container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης σελίδας.</div>';
    return;
  }

  // --- SETUP EVENT LISTENERS ONCE ---
  if (modalElement) {
    const inviteModal = new bootstrap.Modal(modalElement);
    setupModalEventListeners(modalElement, inviteModal, () => currentThesis, refreshPageData);
  }

  const saveExamBtn = document.getElementById("save-examination-btn");
  if (saveExamBtn) {
    saveExamBtn.addEventListener("click", async () => {
      if (!currentThesis) return;

      let operations = [];
      let presentationDataValid = false;

      // --- Prepare Presentation Data ---
      const date = document.getElementById("examDate").value;
      const time = document.getElementById("examTime").value;
      const kind = document.querySelector('input[name="examType"]:checked')?.value;
      const location = document.getElementById("examLocation").value;
      const link = document.getElementById("examLink").value;

      if (date && time && kind) {
        if ((kind === 'in_person' && location) || (kind === 'online' && link)) {
          presentationDataValid = true;
          const formattedDateTime = `${date}T${time}:00`;
          const presentationData = { date: formattedDateTime, kind };
          if (kind === 'online') presentationData.link = link;
          if (kind === 'in_person') presentationData.hall = location;
          
          operations.push(createThesisPresentation(currentThesis.id, presentationData).catch(err => console.error("Presentation save failed:", err)));
        }
      }

      // --- Prepare Links Data ---
      const linksText = document.getElementById("links-to-add").value;
      const linksArray = linksText.split("\n").map((l) => l.trim()).filter((l) => l);
      if (linksArray.length > 0) {
        const resources = linksArray.map((l) => ({ link: l, kind: "other" }));
        operations.push(...resources.map(res => addThesisResources(currentThesis.id, res).catch(err => console.error("Link save failed:", err))));
      }

      // --- Prepare Nimertis Link ---
      const nimertisUrl = document.getElementById("nimertisLink").value.trim();
      if (nimertisUrl) {
        operations.push(setNymertesLink(currentThesis.id, nimertisUrl).catch(err => console.error("Nimertis save failed:", err)));
      }

      if (operations.length === 0) {
        alert("Δεν υπάρχουν αλλαγές προς αποθήκευση.");
        return;
      }

      await Promise.allSettled(operations);
      
      alert("Οι αλλαγές αποθηκεύτηκαν. Η σελίδα θα ανανεωθεί.");
      document.getElementById("links-to-add").value = ""; // Clear textarea after attempting save
      await refreshPageData();
    });
  }

  const uploadDraftBtn = document.getElementById("upload-draft-btn");
  if (uploadDraftBtn) {
    uploadDraftBtn.addEventListener("click", async () => {
      if (!currentThesis) return;
      const fileInput = document.getElementById("thesisFile");
      const file = fileInput.files[0];
      if (!file) {
        alert("Παρακαλώ επιλέξτε ένα αρχείο PDF για ανέβασμα.");
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      try {
        await uploadThesisDraft(currentThesis.id, formData);
        alert("Το αρχείο της διπλωματικής ανέβηκε με επιτυχία.");
        fileInput.value = "";
        await refreshPageData(); // Refresh after upload
      } catch (error) {
        console.error("Failed to upload thesis draft:", error);
        alert("Προέκυψε σφάλμα κατά το ανέβασμα του αρχείου.");
      }
    });
  }

  const downloadDraftBtn = document.getElementById("download-draft-btn");
  if (downloadDraftBtn) {
    downloadDraftBtn.addEventListener("click", async () => {
      // Always attempt the download, regardless of thesis properties.
      if (currentThesis) {
        try {
          const blob = await getThesisDraft(currentThesis.id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          // Use a generic filename since the property is not available.
          a.download = "thesis_draft.pdf";
          document.body.appendChild(a);
a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        } catch (error) {
          // If the API call fails, inform the user.
          console.error("Failed to download thesis draft:", error);
          alert("Δεν βρέθηκε αρχείο για λήψη.");
        }
      }
    });
  }

  // Initial data load and render
  await refreshPageData();
});

// The rest of your functions (setupModalEventListeners, populateInvitationsList, etc.) remain largely the same.
// The key change is that setupModalEventListeners now receives `refreshPageData` as its callback.
// ... (rest of the functions from your file)
function setupModalEventListeners(
  modalElement,
  inviteModal,
  getThesis,
  onInvitationsSent // This is now the refreshPageData function
) {
  // --- Logic to populate the modal right before it's shown ---
  modalElement.addEventListener("show.bs.modal", async () => {
    const thesis = getThesis();
    if (!thesis) return;
    const professorListContainer = document.getElementById("professor-list-container");
    professorListContainer.innerHTML = "<p>Φόρτωση λίστας διδασκόντων...</p>";

    try {
        const [professorsResponse, invitationsResponse] = await Promise.all([
            getProfessors(),
            getThesisInvitations(thesis.id)
        ]);
        const invitations = invitationsResponse.data || [];
        const committeeMemberIds = new Set(thesis.committeeMembers.map((member) => member.professorId));
        const alreadyInvitedIds = new Set(invitations.map((inv) => inv.professorId));

        professorListContainer.innerHTML = "";

        professorsResponse.data.forEach((professor) => {
            if (committeeMemberIds.has(professor.id)) return;

            const isAlreadyInvited = alreadyInvitedIds.has(professor.id);
            const div = document.createElement("div");
            div.className = "form-check";
            div.innerHTML = `
                <input class="form-check-input" type="checkbox" value="${professor.id}" id="prof-${professor.id}" ${isAlreadyInvited ? "disabled" : ""}>
                <label class="form-check-label ${isAlreadyInvited ? "text-muted" : ""}" for="prof-${professor.id}">
                    ${professor.name} ${isAlreadyInvited ? "(Έχει ήδη προσκληθεί)" : ""}
                </label>`;
            professorListContainer.appendChild(div);
        });
    } catch (error) {
      console.error("Error fetching data for modal:", error);
      professorListContainer.innerHTML = '<p class="text-danger">Σφάλμα φόρτωσης διδασκόντων.</p>';
    }
  });

  // --- Logic to handle submitting invitations from the modal ---
  document.getElementById("submit-invitations-btn").onclick = async () => {
    const currentThesis = getThesis();
    const selectedProfessorIds = Array.from(document.querySelectorAll("#professor-list-container .form-check-input:checked")).map(cb => parseInt(cb.value));

    if (selectedProfessorIds.length === 0) {
      alert("Παρακαλώ επιλέξτε τουλάχιστον έναν διδάσκοντα.");
      return;
    }

    try {
      const invitationPromises = selectedProfessorIds.map((id) => sendThesisInvitation(currentThesis.id, id));
      await Promise.all(invitationPromises);
      alert("Οι προσκλήσεις στάλθηκαν με επιτυχία.");
      inviteModal.hide();
      await onInvitationsSent(); // This calls refreshPageData
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert("Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων.");
    }
  };
}

async function populateInvitationsList(invitations, activeStateCard) {
  const invitationList = activeStateCard.querySelector(".invitation-list");
  if (!invitationList) return;

  const relevantInvitations = invitations.filter(inv => inv.response === "pending" || inv.response === "rejected");
  if (relevantInvitations.length === 0) {
    invitationList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν εκκρεμείς ή απορριφθείσες προσκλήσεις.</li>';
    return;
  }

  try {
    const professorsResponse = await getProfessors();
    const professorMap = new Map(professorsResponse.data.map((p) => [p.id, p.name]));
    invitationList.innerHTML = relevantInvitations.map(inv => {
        const professorName = professorMap.get(inv.professorId) || `ID: ${inv.professorId}`;
        const badge = `<span class="badge bg-${inv.response === 'pending' ? 'warning' : 'danger'} rounded-pill">${inv.response === 'pending' ? 'Εκκρεμεί' : 'Απορρίφθηκε'}</span>`;
        return `
            <li class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                    ${professorName}<br>
                    <small class="text-muted">Στάλθηκε: ${new Date(inv.createdAt).toLocaleDateString("el-GR")}</small>
                </div>
                ${badge}
            </li>`;
    }).join('');
  } catch (error) {
    console.error("Error populating invitations list:", error);
    invitationList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης λίστας προσκλήσεων.</li>';
  }
}

function populateCommitteeList(thesis, activeStateCard) {
  const committeeList = activeStateCard.querySelector(".committee-member-list");
  if (!committeeList) return;

  if (!thesis.committeeMembers?.length) {
    committeeList.innerHTML = '<li class="list-group-item">Δεν έχουν οριστεί μέλη επιτροπής.</li>';
    return;
  }

  committeeList.innerHTML = thesis.committeeMembers.map(member => {
    const roleBadge = `<span class="badge bg-success rounded-pill">${Name.ofMemberRole(member.role)}</span>`;
    return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            <div>${member.name}</div>
            ${roleBadge}
        </li>`;
  }).join('');
}

async function populateExaminationState(thesis) {
  // Handle Download Button: Always enable it.
  const downloadDraftBtn = document.getElementById("download-draft-btn");
  downloadDraftBtn.innerHTML = `<i class="fas fa-file-download me-2"></i>Λήψη Τρέχοντος Αρχείου`;
  downloadDraftBtn.disabled = false;

  // Populate Links
  const linksList = document.getElementById("existing-links-list");
  linksList.innerHTML = '';
  try {
    const resourcesResponse = await getThesisResources(thesis.id);
    if (resourcesResponse?.data?.length > 0) {
      linksList.innerHTML = resourcesResponse.data.map(res => `<li class="list-group-item"><a href="${res.link}" target="_blank" rel="noopener noreferrer">${res.link}</a></li>`).join('');
    } else {
      linksList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν αποθηκευμένοι σύνδεσμοι.</li>';
    }
  } catch (error) {
    console.error("Failed to load thesis resources:", error);
    linksList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης συνδέσμων.</li>';
  }

  // Populate Presentation Details
  try {
    const presentationsResponse = await getThesisPresentations(thesis.id);
    if (presentationsResponse?.data?.length > 0) {
      const lastPresentation = presentationsResponse.data.at(-1);
      const presentationDate = new Date(lastPresentation.date);
      document.getElementById("examDate").value = presentationDate.toISOString().split("T")[0];
      const hours = String(presentationDate.getUTCHours()).padStart(2, "0");
      const minutes = String(presentationDate.getUTCMinutes()).padStart(2, "0");
      document.getElementById("examTime").value = `${hours}:${minutes}`;
      document.getElementById("examLocation").value = lastPresentation.hall || "";
      document.getElementById("examLink").value = lastPresentation.link || "";
      const radio = document.getElementById(lastPresentation.kind);
      if (radio) radio.checked = true;
    }
  } catch (error) {
    console.error("Failed to load thesis presentations:", error);
  }

  // Populate Nimertis link
  document.getElementById('nimertisLink').value = thesis.nimertisUrl || '';
}
