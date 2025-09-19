/**
 * Helper function to validate a URL string.
 * @param {string} string The URL string to validate.
 * @returns {boolean} True if the URL is valid, false otherwise.
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

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
      console.log(`[API GET] Fetching details for thesis ID: ${initialThesisId}`);
      const thesisDetailsResponse = await getThesisDetails(initialThesisId);
      console.log("[API GET] Received thesis details:", thesisDetailsResponse.data);
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
          console.log(`[API GET] Fetching invitations for thesis ID: ${currentThesis.id}`);
          const invitationsResponse = await getThesisInvitations(currentThesis.id);
          console.log("[API GET] Received invitations:", invitationsResponse.data);
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
    console.log("[API GET] Fetching initial thesis summary.");
    const thesisSummaryResponse = await getThesis();
    console.log("[API GET] Received thesis summary:", thesisSummaryResponse.data);
    if (!thesisSummaryResponse?.data?.length) {
      container.innerHTML = '<div class="alert alert-warning text-center"><h3>Δεν έχετε αναλάβει κάποια διπλωματική εργασία.</h3></div>';
      return;
    }
    initialThesisId = thesisSummaryResponse.data[0].id;
  } catch (error) {
    console.error("Failed to fetch thesis details:", error);
    container.innerHTML =
      '<div class="alert alert-danger">Σφάλμα φόρτωσης λεπτομερειών διπλωματικής.</div>';
    return;
  }
  let thesis = thesisDetailsResponse.data;
  console.log("Thesis details:", thesis);

  // --- Check for preliminary or terminal statuses ---
  const preliminaryStatuses = {
    pending:
      "Η αίτησή σας για τη διπλωματική εργασία εκκρεμεί για έγκριση από την γραμματεία.",
    rejected:
      "Η αίτησή σας για τη διπλωματική εργασία απορρίφθηκε. Παρακαλώ επικοινωνήστε με την γραμματεία για περισσότερες πληροφορίες.",
    active:
      "Η διπλωματική σας εργασία έχει εγκριθεί και είναι σε κατάσταση ενεργή.",
    cancelled: "Η διπλωματική εργασία έχει ακυρωθεί.",
  };

  if (Object.keys(preliminaryStatuses).includes(thesis.status)) {
    container.innerHTML = `
            <div class="alert alert-info text-center">
                <h3>Ενημέρωση Κατάστασης</h3>
                <p class="lead">${preliminaryStatuses[thesis.status]}</p>
            </div>
        `;
    return; // Stop further execution
  }

  hideAllStates();

  // --- SETUP EVENT LISTENERS ONCE ---
  if (modalElement) {
    const inviteModal = new bootstrap.Modal(modalElement);
    // Pass functions to get the current thesis and invitations data.
    setupModalEventListeners(
      modalElement,
      inviteModal,
      () => thesis,
      () => invitationsResponse
    );
  }

  // Event listener for saving examination details and links
  const saveExamBtn = document.getElementById("save-examination-btn");
  if (saveExamBtn) {
    saveExamBtn.addEventListener("click", async () => {
      if (!currentThesis) return;

      let operations = [];
      let presentationSaveAttempted = false;

      // --- Prepare and Validate Presentation Data ---
      const date = document.getElementById("examDate").value;
      const time = document.getElementById("examTime").value;
      const kind = document.querySelector('input[name="examType"]:checked')?.value;
      const hall = document.getElementById("examLocation").value.trim();
      const link = document.getElementById("examLink").value.trim();

      // Only proceed if the user has filled the main presentation fields
      if (date || time || kind) {
        presentationSaveAttempted = true;
        let isValid = true;
        let validationMessage = "";

        if (!date || !time || !kind) {
          isValid = false;
          validationMessage = "Για να αποθηκεύσετε τις λεπτομέρειες εξέτασης, πρέπει να συμπληρώσετε την Ημερομηνία, την Ώρα και τον Τύπο.";
        } else {
          const selectedDateTime = new Date(`${date}T${time}`);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          if (selectedDateTime < today) {
            isValid = false;
            validationMessage = "Η ημερομηνία εξέτασης δεν μπορεί να είναι στο παρελθόν.";
          } else if (kind === 'online') {
            if (!link) {
              isValid = false;
              validationMessage = "Για διαδικτυακή εξέταση, ο Σύνδεσμος είναι υποχρεωτικός.";
            } else if (!isValidUrl(link)) {
              isValid = false;
              validationMessage = "Ο Σύνδεσμος για διαδικτυακή εξέταση δεν είναι σε έγκυρη μορφή (π.χ. https://example.com).";
            }
            if (hall) {
              isValid = false;
              validationMessage = "Για διαδικτυακή εξέταση, το πεδίο Τοποθεσία πρέπει να είναι κενό.";
            }
          } else if (kind === 'in_person') {
            if (!hall) {
              isValid = false;
              validationMessage = "Για αυτοπρόσωπη εξέταση, η Τοποθεσία είναι υποχρεωτική.";
            }
            // Optional link validation for in-person
            if (link && !isValidUrl(link)) {
              isValid = false;
              validationMessage = "Ο προαιρετικός σύνδεσμος δεν είναι σε έγκυρη μορφή (π.χ. https://example.com).";
            }
          }
        }

      // --- Handle Presentation Data ---
      try {
        const date = document.getElementById("examDate").value;
        const time = document.getElementById("examTime").value;
        const kind = document.querySelector(
          'input[name="examType"]:checked'
        ).value;
        const location = document.getElementById("examLocation").value;
        const link = document.getElementById("examLink").value;

        if (kind === "in_person" && !location) {
          alert("Παρακαλώ εισάγετε την τοποθεσία της εξέτασης.");
          return;
        }
        if (kind === "online" && !link) {
          alert("Παρακαλώ εισάγετε τον σύνδεσμο της τηλεδιάσκεψης.");
          return;
        }
        if (date && time && kind && location) {
          // Format date and time as "YYYY-MM-DDTHH:mm:00"
          const formattedDateTime = `${date}T${time}:00`;
          const presentationData = { date: formattedDateTime, kind };
          if (kind === 'in_person') {
            presentationData.hall = hall;
            if (link) presentationData.link = link; // Link is optional for in-person
          } else { // online
            presentationData.link = link;
            if (location) {
              presentationData.hall = location; // Optional, if provided
            }
          }
          if (kind === "in_person") {
            presentationData.hall = location;
            if (link) {
              presentationData.link = link; // Optional, if provided
            }
          }
          
          console.log("[API POST] Sending presentation data:", presentationData);
          operations.push(createThesisPresentation(currentThesis.id, presentationData).catch(err => console.error("[API POST] Presentation save failed:", err)));
        } else {
          alert(validationMessage);
        }
      } catch (error) {
        console.error("Failed to save presentation details:", error);
        alert(error);
      }
      
      // --- Prepare Links Data ---
      const linksText = document.getElementById("links-to-add").value;
      const linksArray = linksText.split("\n").map((l) => l.trim()).filter((l) => l);
      if (linksArray.length > 0) {
        const resources = linksArray.map((l) => ({ link: l, kind: "other" }));
        console.log("[API POST] Sending resources data:", resources);
        operations.push(...resources.map(res => addThesisResources(currentThesis.id, res).catch(err => console.error("[API POST] Link save failed:", err))));
      }

      // --- Prepare Nimertis Link ---
      const nimertisUrl = document.getElementById("nimertisLink").value.trim();
      if (nimertisUrl) {
        if (isValidUrl(nimertisUrl)) {
          console.log("[API PUT] Sending Nimertis link:", { nemertesLink: nimertisUrl });
          operations.push(setNymertesLink(currentThesis.id, nimertisUrl).catch(err => console.error("[API PUT] Nimertis save failed:", err)));
        } else {
          alert("Ο σύνδεσμος Νημερτής δεν είναι σε έγκυρη μορφή (π.χ. https://example.com).");
        }
      }

      // Only proceed if there are non-presentation operations, or if presentation was not attempted.
      if (operations.length === 0 && presentationSaveAttempted) {
        // This case happens if presentation validation failed and there was nothing else to save.
        // The alert was already shown, so we just stop.
        return;
      }
      
      if (operations.length === 0) {
        alert("Δεν υπάρχουν αλλαγές προς αποθήκευση.");
        return;
      }

      await Promise.allSettled(operations);
      
      alert("Οι αλλαγές αποθηκεύτηκαν");
      document.getElementById("links-to-add").value = ""; // Clear textarea after attempting save
      await refreshPageData();
    });
  }

  // Add event listener for uploading the thesis draft
  const uploadDraftBtn = document.getElementById("upload-draft-btn");
  if (uploadDraftBtn) {
    uploadDraftBtn.addEventListener("click", async () => {
      if (!thesis) return;

      const fileInput = document.getElementById("thesisFile");
      const file = fileInput.files[0];

      if (!file) {
        alert("Παρακαλώ επιλέξτε ένα αρχείο PDF για ανέβασμα.");
        return;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        console.log(`[API PUT] Uploading draft for thesis ID: ${currentThesis.id}`);
        await uploadThesisDraft(currentThesis.id, formData);
        console.log("[API PUT] Draft upload successful.");
        alert("Το αρχείο της διπλωματικής ανέβηκε με επιτυχία.");
        fileInput.value = "";
        await refreshPageData(); // Refresh after upload
      } catch (error) {
        console.error("Failed to upload thesis draft:", error);
        alert("Προέκυψε σφάλμα κατά το ανέβασμα του αρχείου.");
      }
    });
  }

  // --- Display Current Draft Button ---
  const downloadDraftBtn = document.getElementById("download-draft-btn");

  downloadDraftBtn.innerHTML = `
        <i class="fas fa-file-download me-2"></i>Λήψη Τρέχοντος Αρχείου
    `;
  downloadDraftBtn.style.display = "block";

  if (downloadDraftBtn) {
    downloadDraftBtn.addEventListener("click", async () => {
      // Always attempt the download, regardless of thesis properties.
      if (currentThesis) {
        try {
          console.log(`[API GET] Downloading draft for thesis ID: ${currentThesis.id}`);
          const blob = await getThesisDraft(currentThesis.id);
          console.log("[API GET] Draft download successful, received blob:", blob);
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
          alert("Προέκυψε σφάλμα κατά τη λήψη του αρχείου.");
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
    const thesis = getThesis(); // Get the most recent thesis data
    const invitations = getInvitations(); // Get the most recent invitations data
    const professorListContainer = document.getElementById(
      "professor-list-container"
    );
    professorListContainer.innerHTML = "<p>Φόρτωση λίστας διδασκόντων...</p>";

    try {
        console.log("[API GET] Fetching professors and invitations for modal.");
        const [professorsResponse, invitationsResponse] = await Promise.all([
            getProfessors(),
            getThesisInvitations(thesis.id)
        ]);
        console.log("[API GET] Received professors for modal:", professorsResponse.data);
        console.log("[API GET] Received invitations for modal:", invitationsResponse.data);
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
      console.error("Error fetching professors for modal:", error);
      professorListContainer.innerHTML =
        '<p class="text-danger">Σφάλμα φόρτωσης διδασκόντων.</p>';
    }
  });

  // --- Logic to handle submitting invitations from the modal ---
  document.getElementById("submit-invitations-btn").onclick = async () => {
    const currentThesis = getThesis(); // Get the most recent thesis data
    const selectedCheckboxes = document.querySelectorAll(
      "#professor-list-container .form-check-input:checked"
    );
    const selectedProfessorIds = Array.from(selectedCheckboxes).map((cb) =>
      parseInt(cb.value)
    );

    if (selectedProfessorIds.length === 0) {
      alert("Παρακαλώ επιλέξτε τουλάχιστον έναν διδάσκοντα.");
      return;
    }

    try {
      console.log("[API POST] Sending invitations to professors:", selectedProfessorIds);
      const invitationPromises = selectedProfessorIds.map((id) => sendThesisInvitation(currentThesis.id, id));
      await Promise.all(invitationPromises);
      console.log("[API POST] Invitations sent successfully.");
      alert("Οι προσκλήσεις στάλθηκαν με επιτυχία.");
      inviteModal.hide();
      await onInvitationsSent(); // This calls refreshPageData
    } catch (error) {
      console.error("Error sending one or more invitations:", error);
      alert(
        "Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων. Ενδέχεται κάποιες προσκλήσεις να μην στάλθηκαν."
      );
    }
  };
}

/**
 * Populates the list of pending and rejected invitations within a given state card.
 * @param {Array} invitations - The array of invitation objects from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
async function populateInvitationsList(invitations, activeStateCard) {
  console.log("Populating invitations:", invitations);
  const invitationList = activeStateCard.querySelector(".invitation-list");
  if (!invitationList) {
    // This is expected if the card is not 'state-assignment'
    return;
  }

  invitationList.innerHTML = ""; // Clear existing list

  const relevantInvitations = invitations.filter(
    (inv) => inv.response === "pending" || inv.response === "rejected"
  );

  if (relevantInvitations.length === 0) {
    invitationList.innerHTML =
      '<li class="list-group-item">Δεν υπάρχουν εκκρεμείς ή απορριφθείσες προσκλήσεις.</li>';
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
    console.error("Error fetching professors for invitations list:", error);
    invitationList.innerHTML =
      '<li class="list-group-item text-danger">Σφάλμα φόρτωσης λίστας προσκλήσεων.</li>';
  }
}

/**
 * Populates the committee list within a given state card.
 * This function is used to repopulate the committee list in the active state card
 * after an sendThesisInvitationation is sent or when the modal is closed and reopened.
 * @param {object} thesis - The detailed thesis object from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
function populateCommitteeList(thesis, activeStateCard) {
  const committeeList = activeStateCard.querySelector(".committee-member-list");
  if (!committeeList) {
    // This is expected in states that don't have a committee list.
    return;
  }

  committeeList.innerHTML = ""; // Clear existing list items

  if (!thesis.committeeMembers || thesis.committeeMembers.length === 0) {
    committeeList.innerHTML =
      '<li class="list-group-item">Δεν έχουν οριστεί μέλη επιτροπής.</li>';
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
  linksList.innerHTML = ""; // Clear current list

  try {
    console.log(`[API GET] Fetching resources for thesis ID: ${thesis.id}`);
    const resourcesResponse = await getThesisResources(thesis.id);
    console.log("[API GET] Received resources:", resourcesResponse.data);
    if (resourcesResponse?.data?.length > 0) {
      resourcesResponse.data.forEach((resource) => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.innerHTML = `<a href="${resource.link}" target="_blank" rel="noopener noreferrer">${resource.link}</a>`;
        linksList.appendChild(li);
      });
    } else {
      linksList.innerHTML =
        '<li class="list-group-item">Δεν υπάρχουν αποθηκευμένοι σύνδεσμοι.</li>';
    }
  } catch (error) {
    console.error("Failed to load thesis resources:", error);
    linksList.innerHTML =
      '<li class="list-group-item text-danger">Σφάλμα φόρτωσης συνδέσμων.</li>';
  }

  // Populate Presentation Details
  try {
    console.log(`[API GET] Fetching presentations for thesis ID: ${thesis.id}`);
    const presentationsResponse = await getThesisPresentations(thesis.id);
    console.log("[API GET] Received presentations:", presentationsResponse.data);
    if (presentationsResponse?.data?.length > 0) {
      const lastPresentation =
        presentationsResponse.data[presentationsResponse.data.length - 1]; //get the last presentation

      const presentationDate = new Date(lastPresentation.date);

      // Format date as YYYY-MM-DD
      document.getElementById("examDate").value = presentationDate
        .toISOString()
        .split("T")[0];

      // Format time as HH:MM
      const hours = String(presentationDate.getUTCHours()).padStart(2, "0");
      const minutes = String(presentationDate.getUTCMinutes()).padStart(2, "0");
      document.getElementById("examTime").value = `${hours}:${minutes}`;

      document.getElementById("examLocation").value =
        lastPresentation.hall || "";
      document.getElementById("examLink").value = lastPresentation.link || "";

      const examType = lastPresentation.kind || "in_person";
      const radio = document.getElementById(examType);
      if (radio) {
        radio.checked = true;
      }
    } else {
      // Fallback if no presentations are found
      document.getElementById("examDate").value = "";
      document.getElementById("examTime").value = "";
      document.getElementById("examLocation").value = "";
      document.getElementById("examLink").value = "";
    }
  } catch (error) {
    console.error("Failed to load thesis presentations:", error);
    // Clear fields on error to avoid showing stale data
    document.getElementById("examDate").value = "";
    document.getElementById("examTime").value = "";
    document.getElementById("examLocation").value = "";
    document.getElementById("examLink").value = "";
  }

  // Populate Nimertis link
  document.getElementById('nimertisLink').value = thesis.nimertisUrl || '';
}
