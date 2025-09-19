document.addEventListener("DOMContentLoaded", async () => {
  const container = document.querySelector(".container-fluid.py-4");
  const stateAssignment = document.getElementById("state-assignment");
  const stateExamination = document.getElementById("state-examination");
  const stateCompleted = document.getElementById("state-completed");
  const modalElement = document.getElementById("invite-modal");

  let currentThesis;
  let initialThesisId;

  const hideAllStates = () => {
    [stateAssignment, stateExamination, stateCompleted].forEach(state => {
      if (state) state.style.display = "none";
    });
  };

  const refreshPageData = async () => {
    if (!initialThesisId) return;
    try {
      const thesisDetailsResponse = await getThesisDetails(initialThesisId);
      currentThesis = thesisDetailsResponse.data;

      // Check for preliminary statuses
      const preliminaryStatuses = {
        pending: "Η αίτησή σας για τη διπλωματική εργασία εκκρεμεί για έγκριση από την γραμματεία.",
        rejected: "Η αίτησή σας για τη διπλωματική εργασία απορρίφθηκε. Παρακαλώ επικοινωνήστε με την γραμματεία για περισσότερες πληροφορίες.",
        active: "Η διπλωματική σας εργασία έχει εγκριθεί και είναι σε κατάσταση ενεργή."      };

      if (Object.keys(preliminaryStatuses).includes(currentThesis.status)) {
        container.innerHTML = `
          <div class="alert alert-info text-center">
            <h3>Ενημέρωση Κατάστασης</h3>
            <p class="lead">${preliminaryStatuses[currentThesis.status]}</p>
          </div>`;
        return;
      }

      // Determine active state
      let activeStateCard;
      switch (currentThesis.status) {
        case "under_assignment": activeStateCard = stateAssignment; break;
        case "under_examination": activeStateCard = stateExamination; break;
        case "completed": activeStateCard = stateCompleted; break;
        default: activeStateCard = stateAssignment;
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

        } else if (currentThesis.status === "completed") {
          populateCompletedState(currentThesis);
        }
      }
    } catch (error) {
      console.error("Failed to refresh page data:", error);
      container.innerHTML = '<div class="alert alert-danger">Σφάλμα ανανέωσης δεδομένων σελίδας.</div>';
    }
  };

  // Initial load
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

  // Setup event listeners
  if (modalElement) {
    const inviteModal = new bootstrap.Modal(modalElement);
    setupModalEventListeners(modalElement, inviteModal, () => currentThesis, refreshPageData);
  }

  const saveExamBtn = document.getElementById("save-examination-btn");
  if (saveExamBtn) {
    saveExamBtn.addEventListener("click", async () => {
      if (!currentThesis) return;

      let operations = [];
      let presentationSaveAttempted = false;

      // Validate and prepare presentation data
      const date = document.getElementById("examDate").value;
      const time = document.getElementById("examTime").value;
      const kind = document.querySelector('input[name="examType"]:checked')?.value;
      const hall = document.getElementById("examLocation").value.trim();
      const link = document.getElementById("examLink").value.trim();

      if (date || time || kind) {
        presentationSaveAttempted = true;
        const { isValid, validationMessage } = validatePresentationData({ date, time, kind, hall, link });
        handlePresentationSave({ isValid, validationMessage, date, time, kind, hall, link, currentThesis, operations });
      }

      // Prepare links data
      const linksText = document.getElementById("links-to-add").value;
      const linksArray = linksText.split("\n").map(l => l.trim()).filter(l => l);
      if (linksArray.length > 0) {
        const resources = linksArray.map(l => ({ link: l, kind: "other" }));
        operations.push(...resources.map(res => addThesisResources(currentThesis.id, res).catch(err => console.error("Link save failed:", err))));
      }

      // Prepare Nimertis link
      if (currentThesis.grade){
        const nimertisUrl = document.getElementById("nimertisLink").value.trim();
      if (nimertisUrl) {
        if (isValidUrl(nimertisUrl)) {
          operations.push(setNymertesLink(currentThesis.id, nimertisUrl).catch(err => console.error("Nimertis save failed:", err)));
        } else {
          alert("Ο σύνδεσμος Νημερτής δεν είναι σε έγκυρη μορφή.");
        }
      }
      }
      

      if (operations.length === 0 && presentationSaveAttempted) return;
      if (operations.length === 0) {
        alert("Δεν υπάρχουν αλλαγές προς αποθήκευση.");
        return;
      }

      await Promise.allSettled(operations);
      alert("Οι αλλαγές αποθηκεύτηκαν");
      document.getElementById("links-to-add").value = "";
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
        await refreshPageData();
      } catch (error) {
        console.error("Failed to upload thesis draft:", error);
        alert("Προέκυψε σφάλμα κατά το ανέβασμα του αρχείου.");
      }
    });
  }

  const downloadDraftBtn = document.getElementById("download-draft-btn");
  if (downloadDraftBtn) {
    downloadDraftBtn.addEventListener("click", async () => {
      if (currentThesis) {
        try {
          const blob = await getThesisDraft(currentThesis.id);
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = "thesis_draft.pdf";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          a.remove();
        } catch (error) {
          console.error("Failed to download thesis draft:", error);
          alert("Δεν βρέθηκε αρχείο για λήψη.");
        }
      }
    });
  }

  await refreshPageData();
});

function setupModalEventListeners(modalElement, inviteModal, getThesis, onInvitationsSent) {
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
      const committeeMemberIds = new Set(thesis.committeeMembers.map(member => member.professorId));
      const alreadyInvitedIds = new Set(invitations.map(inv => inv.professorId));

      professorListContainer.innerHTML = "";
      professorsResponse.data.forEach(professor => {
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

  document.getElementById("submit-invitations-btn").onclick = async () => {
    const currentThesis = getThesis();
    const selectedProfessorIds = Array.from(document.querySelectorAll("#professor-list-container .form-check-input:checked")).map(cb => parseInt(cb.value));

    if (selectedProfessorIds.length === 0) {
      alert("Παρακαλώ επιλέξτε τουλάχιστον έναν διδάσκοντα.");
      return;
    }

    try {
      const invitationPromises = selectedProfessorIds.map(id => sendThesisInvitation(currentThesis.id, id));
      await Promise.all(invitationPromises);
      alert("Οι προσκλήσεις στάλθηκαν με επιτυχία.");
      inviteModal.hide();
      await onInvitationsSent();
    } catch (error) {
      console.error("Error sending invitations:", error);
      alert("Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων.");
    }
  };
}

async function populateCompletedState(thesis) {
  // Fill thesis details
  document.getElementById("thesis-title").textContent = thesis.topic || "-";
 
  document.getElementById("thesis-description").textContent = thesis.topicSummary || "-";
  const fileLink = document.getElementById("thesis-description-file");
  if (fileLink) {
    if (thesis.descriptionFileUrl) {
      fileLink.href = thesis.descriptionFileUrl;
      fileLink.style.display = "";
    } else {
      fileLink.href = "#";
      fileLink.style.display = "none";
    }
  }

  await addPraktikoButton(thesis);
  await populateTimeline(thesis.id); 
}

async function populateInvitationsList(invitations, activeStateCard) {
  const invitationList = activeStateCard.querySelector(".invitation-list");
  if (!invitationList) return;

  const relevantInvitations = invitations.filter(inv => inv.response === "pending" || inv.response === "declined");
  if (relevantInvitations.length === 0) {
    invitationList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν εκκρεμείς ή απορριφθείσες προσκλήσεις.</li>';
    return;
  }

  try {
    const professorsResponse = await getProfessors();
    const professorMap = new Map(professorsResponse.data.map(p => [p.id, p.name]));
    invitationList.innerHTML = relevantInvitations.map(inv => {
      const professorName = professorMap.get(inv.professorId) || `ID: ${inv.professorId}`;
      const badge = `<span class="badge bg-${inv.response === 'pending' ? 'warning' : 'danger'} rounded-pill">${inv.response === 'pending' ? 'Εκκρεμεί' : 'Απορρίφθηκε'}</span>`;
      return `
        <li class="list-group-item d-flex justify-content-between align-items-center">
          <div>${professorName}<br><small class="text-muted">Στάλθηκε: ${new Date(inv.createdAt).toLocaleDateString("el-GR")}</small></div>
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
  const downloadDraftBtn = document.getElementById("download-draft-btn");
  downloadDraftBtn.innerHTML = `<i class="fas fa-file-download me-2"></i>Λήψη Τρέχοντος Αρχείου`;
  downloadDraftBtn.disabled = false;

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

  document.getElementById('nimertisLink').value = thesis.nimertisUrl || '';

  // Disable Νημερτής card if grade is null
  const nimertisInput = document.getElementById('nimertisLink');
  if (nimertisInput) {
    nimertisInput.disabled = thesis.grade == null;
    // Optionally, visually indicate only the input is disabled
    nimertisInput.classList.toggle('opacity-20', thesis.grade == null);
  }

  await addPraktikoButton(thesis);
  
}

async function addPraktikoButton(thesis) {
  const thesisId = thesis.id;
  // Find the visible state card
  const stateCard = document.querySelector('.card.shadow-sm[style*="display: block"]');
  if (!stateCard) return;

  const viewPraktikoBtn = stateCard.querySelector("#view-praktiko-btn");
  if (viewPraktikoBtn && thesisId) {
    // Disable the button if thesis.grade is null
    if (thesis.grade == null) {
      viewPraktikoBtn.disabled = true;
      viewPraktikoBtn.title = "Το πρακτικό είναι διαθέσιμο μόνο όταν υπάρχει βαθμός.";
      return;
    }

    let hasPresentation = false;
    try {
      const presentationsResponse = await getThesisPresentations(thesisId);
      hasPresentation = presentationsResponse?.data?.length > 0;
    } catch (error) {
      console.error("Failed to fetch presentations:", error);
      viewPraktikoBtn.disabled = true;
      viewPraktikoBtn.title = "Σφάλμα κατά τον έλεγχο παρουσίασης.";
      return;
    }

    viewPraktikoBtn.onclick = () => {
      if (hasPresentation) {
        window.open(`/praktiko?thesisId=${thesisId}`, "_blank");
      } else {
        alert("Δεν έχει καταχωρηθεί παρουσίαση για τη διπλωματική εργασία. Το πρακτικό δεν είναι διαθέσιμο.");
      }
    };
  }
}
/**
 * Helper function to validate a URL string.
 */
function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function validatePresentationData({ date, time, kind, hall, link }) {
  if (!date || !time || !kind) {
    return {
      isValid: false,
      validationMessage: "Για να αποθηκεύσετε τις λεπτομέρειες εξέτασης, πρέπει να συμπληρώσετε την Ημερομηνία, την Ώρα και τον Τύπο."
    };
  }
  const selectedDateTime = new Date(`${date}T${time}`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (selectedDateTime < today) {
    return {
      isValid: false,
      validationMessage: "Η ημερομηνία εξέτασης δεν μπορεί να είναι στο παρελθόν."
    };
  }
  if (kind === 'online') {
    if (!link || !isValidUrl(link)) {
      return {
        isValid: false,
        validationMessage: "Για διαδικτυακή εξέταση, ο Σύνδεσμος είναι υποχρεωτικός και πρέπει να είναι έγκυρος."
      };
    }
    if (hall) {
      return {
        isValid: false,
        validationMessage: "Για διαδικτυακή εξέταση, το πεδίο Τοποθεσία πρέπει να είναι κενό."
      };
    }
  } else if (kind === 'in_person') {
    if (!hall) {
      return {
        isValid: false,
        validationMessage: "Για αυτοπρόσωπη εξέταση, η Τοποθεσία είναι υποχρεωτική."
      };
    }
    if (link && !isValidUrl(link)) {
      return {
        isValid: false,
        validationMessage: "Ο προαιρετικός σύνδεσμος δεν είναι σε έγκυρη μορφή."
      };
    }
  }
  return { isValid: true, validationMessage: "" };
}

async function populateTimeline(thesisId) {
  const timelineList = document.getElementById("thesis-timeline-list");
  if (!timelineList) return;

  timelineList.innerHTML = `<li class="list-group-item text-center text-muted">Φόρτωση ιστορικού...</li>`;

  try {
    const timelineResponse = await getThesisTimeline(thesisId);
    const timeline = timelineResponse?.data || [];

    if (!timeline.length) {
      timelineList.innerHTML = `<li class="list-group-item text-center text-muted">Δεν υπάρχουν αλλαγές κατάστασης.</li>`;
      return;
    }

    timelineList.innerHTML = timeline
      .map(entry => {
        const date = new Date(entry.changedAt).toLocaleString("el-GR");
        return `
          <li class="list-group-item d-flex justify-content-between align-items-center">
            <span>
              ${getStatusBadge(entry.oldStatus)}
              <span class="mx-2" style="font-size:1.2em;">&#8594;</span>
              ${getStatusBadge(entry.newStatus)}
            </span>
            <span class="text-muted small">${date}</span>
          </li>
        `;
      })
      .reverse()
      .join("");
  } catch (error) {
    console.error("Failed to load thesis timeline:", error);
    timelineList.innerHTML = `<li class="list-group-item text-danger">Σφάλμα φόρτωσης ιστορικού.</li>`;
  }
}

// Add this at the top of your JS file or near the Name object
const statusBadgeClass = {
  under_assignment: "bg-secondary",
  active: "bg-primary",
  under_examination: "bg-warning text-dark",
  completed: "bg-success",
};

function getStatusBadge(status) {
  return `<span class="badge ${statusBadgeClass[status] || "bg-dark"}">${Name.ofThesisStatus(status)}</span>`;
}

function handlePresentationSave({ isValid, validationMessage, date, time, kind, hall, link, currentThesis, operations }) {
  if (isValid) {
    const formattedDateTime = `${date}T${time}:00`;
    const presentationData = { date: formattedDateTime, kind };
    if (kind === 'in_person') {
      presentationData.hall = hall;
      if (link) presentationData.link = link;
    } else {
      presentationData.link = link;
    }
    operations.push(
      createThesisPresentation(currentThesis.id, presentationData)
        .catch(err => console.error("Presentation save failed:", err))
    );
  } else {
    alert(validationMessage);
  }
}

