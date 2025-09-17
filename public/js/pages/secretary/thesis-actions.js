let thesisId;

async function onThesisApprovalFormSubmit(event) {
  event.preventDefault();

  const assemblyNumber = event.target.assemblyNumber.value;

  try {
    if (event.target.decision.value == "accept") {
      const protocolNumber = event.target.protocolNumber.value;
      if (protocolNumber == null || protocolNumber.trim() === "") {
        alert("Παρακαλώ συμπληρώστε τον Αριθμό Πρωτοκόλλου (ΑΠ).");
        return;
      }
      await approveThesis(thesisId, assemblyNumber, protocolNumber);
    } else {
      const reason = event.target.reason.value;
      if (reason == null || reason.trim() === "") {
        alert("Παρακαλώ συμπληρώστε τον λόγο απόρριψης.");
        return;
      }
      await cancelThesis(thesisId, assemblyNumber, reason);
    }
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
  }
}

async function onThesisApprovalFormReset(event) {
  event.preventDefault();

  const rejectCheckbox = document.getElementById("reject-checkbox");
  const acceptCheckbox = document.getElementById("accept-checkbox");
  const assemblyNumberInput = document.getElementById("assembly-number-input");
  const protocolNumberInput = document.getElementById("protocol-number-input");
  const reasonInput = document.getElementById("reason-input");

  protocolNumberInput.value = "";
  reasonInput.value = "";
  acceptCheckbox.checked = true;
  rejectCheckbox.checked = false;
  assemblyNumberInput.value = "";

  const protocolNumberSection = document.getElementById(
    "protocol-number-section"
  );
  const reasonSection = document.getElementById("reason-section");

  protocolNumberSection.classList.remove("d-none");
  reasonSection.classList.add("d-none");
}

async function onRejectCheckboxChange(event) {
  const protocolNumberSection = document.getElementById(
    "protocol-number-section"
  );
  const reasonSection = document.getElementById("reason-section");

  if (event.target.checked) {
    protocolNumberSection.classList.add("d-none");
    reasonSection.classList.remove("d-none");
  }
}

async function onAcceptCheckboxChange(event) {
  const protocolNumberSection = document.getElementById(
    "protocol-number-section"
  );
  const reasonSection = document.getElementById("reason-section");

  if (event.target.checked) {
    protocolNumberSection.classList.remove("d-none");
    reasonSection.classList.add("d-none");
  }
}

async function onCompleteThesisButtonClick(event) {
  event.preventDefault();

  try {
    await completeThesis(thesisId);
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
    return;
  }
}

function renderThesisActions(thesis) {
  thesisId = thesis.id;

  const thesisActionsActive = document.getElementById("thesis-actions-active");
  const thesisActionsNone = document.getElementById("thesis-actions-none");
  const thesisActionsUnderExam = document.getElementById(
    "thesis-actions-under_examination"
  );

  switch (thesis.status) {
    case "active":
      thesisActionsActive.classList.remove("d-none");
      thesisActionsNone.classList.add("d-none");
      thesisActionsUnderExam.classList.add("d-none");
      break;
    case "under_examination":
      thesisActionsActive.classList.add("d-none");
      thesisActionsNone.classList.add("d-none");
      thesisActionsUnderExam.classList.remove("d-none");
      break;
    default:
      thesisActionsActive.classList.add("d-none");
      thesisActionsNone.classList.remove("d-none");
      thesisActionsUnderExam.classList.add("d-none");
  }

  const completeThesisButton = document.getElementById("complete-thesis-btn");
  const nemertesLink = document.getElementById("nemertes-link");

  // TODO: grading-status

  if (thesis.nemertesLink == null) {
    completeThesisButton.classList.add("disabled");
  } else {
    completeThesisButton.classList.remove("disabled");
  }

  if (thesis.nemertesLink != null) {
    nemertesLink.innerHTML = `<a href="${nemertesLink}" target="_blank" rel="noopener noreferrer">${nemertesLink}</a>`;
    nemertesLink.href = thesis.nemertesLink;
  } else {
    nemertesLink.innerHTML = "Αναμένεται από φοιτητή/τρια...";
    nemertesLink.href = "#";
  }

  completeThesisButton.addEventListener("click", onCompleteThesisButtonClick);

  const thesisApprovalForm = document.getElementById("thesis-approval-form");
  const rejectCheckbox = document.getElementById("reject-checkbox");
  const acceptCheckbox = document.getElementById("accept-checkbox");

  thesisApprovalForm.addEventListener("submit", onThesisApprovalFormSubmit);
  thesisApprovalForm.addEventListener("reset", onThesisApprovalFormReset);
  acceptCheckbox.addEventListener("change", onAcceptCheckboxChange);
  rejectCheckbox.addEventListener("change", onRejectCheckboxChange);

  thesisApprovalForm.reset();
}
