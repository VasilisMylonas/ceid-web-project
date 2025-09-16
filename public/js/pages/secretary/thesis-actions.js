async function onThesisApprovalFormSubmit(event) {
  event.preventDefault();

  // TODO
}

async function onThesisApprovalFormReset(event) {
  event.preventDefault();

  const rejectCheckbox = document.getElementById("reject-checkbox");
  const acceptCheckbox = document.getElementById("accept-checkbox");

  acceptCheckbox.checked = true;
  rejectCheckbox.checked = false;
  const collapse = new bootstrap.Collapse("#rejection-reason-section", {
    toggle: false,
  });
  collapse.hide();
}

async function onRejectCheckboxChange(event) {
  const collapse = new bootstrap.Collapse("#rejection-reason-section", {
    toggle: false,
  });

  if (event.target.checked) {
    collapse.show();
  }
}

async function onAcceptCheckboxChange(event) {
  const collapse = new bootstrap.Collapse("#rejection-reason-section", {
    toggle: false,
  });

  if (event.target.checked) {
    collapse.hide();
  }
}

function renderThesisActions(thesis) {
  const thesisActionsPending = document.getElementById(
    "thesis-actions-pending"
  );
  const thesisActionsNone = document.getElementById("thesis-actions-none");
  const thesisActionsUnderExam = document.getElementById(
    "thesis-actions-under_examination"
  );

  switch (thesis.status) {
    case "pending":
      thesisActionsPending.classList.remove("d-none");
      thesisActionsNone.classList.add("d-none");
      thesisActionsUnderExam.classList.add("d-none");
      break;
    case "under_examination":
      thesisActionsPending.classList.add("d-none");
      thesisActionsNone.classList.add("d-none");
      thesisActionsUnderExam.classList.remove("d-none");
      break;
    default:
      thesisActionsPending.classList.add("d-none");
      thesisActionsNone.classList.remove("d-none");
      thesisActionsUnderExam.classList.add("d-none");
  }

  const completeThesisButton = document.getElementById("complete-thesis-btn");
  const nemertesLink = document.getElementById("nemertes-link");

  // TODO: grading-status, and button press

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

  const thesisApprovalForm = document.getElementById("thesis-approval-form");
  const rejectCheckbox = document.getElementById("reject-checkbox");
  const acceptCheckbox = document.getElementById("accept-checkbox");

  thesisApprovalForm.addEventListener("submit", onThesisApprovalFormSubmit);
  thesisApprovalForm.addEventListener("reset", onThesisApprovalFormReset);

  acceptCheckbox.checked = true;
  rejectCheckbox.checked = false;

  acceptCheckbox.addEventListener("change", onAcceptCheckboxChange);
  rejectCheckbox.addEventListener("change", onRejectCheckboxChange);
}
