let thesisGlobal;

async function onThesisApprovalFormSubmit(event) {
  event.preventDefault();

  const assemblyNumber = event.target.elements.assemblyNumber.value;
  const protocolNumber = event.target.elements.protocolNumber.value;

  try {
    if (protocolNumber == null || protocolNumber.trim() === "") {
      alert("Παρακαλώ συμπληρώστε τον Αριθμό Πρωτοκόλλου (ΑΠ).");
      return;
    }
    await approveThesis(thesisGlobal.id, assemblyNumber, protocolNumber);
    // } else {
    // const reason = event.target.reason.value;
    // if (reason == null || reason.trim() === "") {
    //   alert("Παρακαλώ συμπληρώστε τον λόγο απόρριψης.");
    //   return;
    // }
    // await cancelThesis(thesisId, assemblyNumber, reason);
    // }
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
  }
}

async function onThesisApprovalFormReset(event) {
  event.preventDefault();

  if (thesisGlobal.protocolNumber !== null) {
    event.target.elements.protocolNumber.value = thesisGlobal.protocolNumber;
    event.target.elements.assemblyNumber.value = thesisGlobal.assemblyNumber;

    event.target.elements.protocolNumber.disabled = true;
    event.target.elements.assemblyNumber.disabled = true;
    event.target.elements.submitButton.disabled = true;
    event.target.elements.resetButton.disabled = true;
  } else {
    event.target.elements.protocolNumber.value = "";
    event.target.elements.assemblyNumber.value = "";
  }
}

async function onThesisCancelFormSubmit(event) {
  event.preventDefault();

  const assemblyNumber = event.target.elements.assemblyNumber.value;
  const reason = event.target.elements.reason.value;

  try {
    if (assemblyNumber == null || assemblyNumber.trim() === "") {
      alert("Παρακαλώ συμπληρώστε τον αριθμό γενικής συνέλευσης.");
      return;
    }

    if (reason == null || reason.trim() === "") {
      alert("Παρακαλώ συμπληρώστε τον λόγο απόρριψης.");
      return;
    }
    await cancelThesis(thesisGlobal.id, assemblyNumber, reason);
    window.location.reload();
  } catch (error) {
    console.error(error);
    alert("Παρουσιάστηκε σφάλμα. Παρακαλώ δοκιμάστε ξανά.");
  }
}

async function onThesisCancelFormReset(event) {
  event.preventDefault();

  event.target.elements.reason.value = "";
  event.target.elements.assemblyNumber.value = "";
}

function renderThesisActions(thesis) {
  thesisGlobal = thesis;

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

  // Complete thesis actions
  const completeThesisButton = document.getElementById("complete-thesis-btn");
  const nemertesLink = document.getElementById("nemertes-link");
  const grade = document.getElementById("grade");

  if (thesis.nemertesLink === null || thesis.grade == null) {
    completeThesisButton.classList.add("disabled");
  } else {
    completeThesisButton.classList.remove("disabled");
  }

  if (thesis.grade !== null) {
    grade.textContent = thesis.grade;
  } else {
    grade.textContent = "Σε εξέλιξη...";
  }

  if (thesis.nemertesLink !== null) {
    nemertesLink.innerHTML = `
    <a href="${thesis.nemertesLink}" target="_blank" rel="noopener noreferrer">
      ${thesis.nemertesLink}
    </a>`;
  } else {
    nemertesLink.innerHTML = "Αναμένεται από φοιτητή/τρια...";
    nemertesLink.href = "#";
  }

  const thesisApprovalForm = document.getElementById("thesis-approval-form");

  thesisApprovalForm.addEventListener("submit", onThesisApprovalFormSubmit);
  thesisApprovalForm.addEventListener("reset", onThesisApprovalFormReset);

  const thesisCancelForm = document.getElementById("thesis-cancel-form");
  thesisCancelForm.addEventListener("submit", onThesisCancelFormSubmit);
  thesisCancelForm.addEventListener("reset", onThesisCancelFormReset);

  thesisApprovalForm.reset();
  thesisCancelForm.reset();

  completeThesisButton.addEventListener("click", completeThesisHandler);
}

async function completeThesisHandler() {
  console.log("Complete Thesis");
  await completeThesis(thesisGlobal.id);
  window.location.reload();
}
