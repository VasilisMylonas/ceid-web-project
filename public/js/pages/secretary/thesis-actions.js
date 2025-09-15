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
