function renderThesisStatusProgress(status) {
  const progressBar = document.getElementById("thesis-progress-bar");

  progressBar.classList.remove("bg-warning");
  progressBar.classList.remove("bg-danger");
  progressBar.classList.remove("bg-success");
  progressBar.classList.remove("bg-info");
  progressBar.classList.remove("bg-dark");
  progressBar.classList.add(getThesisStatusBootstrapBgClass(status));
  progressBar.textContent = "";

  switch (status) {
    case "under_assignment":
      progressBar.style.width = "5%";
      break;
    case "active":
      progressBar.style.width = "35%";
      break;
    case "under_examination":
      progressBar.style.width = "65%";
      break;
    case "completed":
      progressBar.style.width = "100%";
      break;
    case "cancelled":
      progressBar.style.width = "100%";
      progressBar.textContent = "Ακυρώθηκε";
      break;
  }
}

function makeDaysSinceString(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;

  let elapsedText = "";

  if (years > 0) {
    elapsedText += `πριν ${years} ${years === 1 ? "χρόνο" : "χρόνια"}`;
    if (days > 0) {
      elapsedText += ` και ${days} μέρες`;
    }
  } else {
    elapsedText = `πριν ${days} μέρες`;
    if (days == 0) {
      elapsedText = "σήμερα";
    }
    if (days == 1) {
      elapsedText = "χθες";
    }
  }

  return elapsedText;
}

function renderThesisDetails(thesis) {
  const descriptionURL = `/api/v1/topics/${thesis.topicId}/description`;

  const assignmentDate = document.getElementById("thesis-assignment-date");
  const assignmentTimeElapsed = document.getElementById(
    "thesis-assignment-time-elapsed"
  );
  const pdfDownloadBtn = document.getElementById("thesis-pdf-download-btn");
  const pdfPreviewBtn = document.getElementById("thesis-pdf-preview-btn");
  const committeeList = document.getElementById("thesis-committee-members");
  const thesisTopic = document.getElementById("thesis-topic");
  const thesisSummary = document.getElementById("thesis-summary");
  const thesisStudent = document.getElementById("thesis-student");
  const thesisStatus = document.getElementById("thesis-status");

  // Set date only if present
  if (thesis.startDate == null) {
    assignmentTimeElapsed.textContent = "";
    assignmentDate.textContent = "-";
  } else {
    const startDate = new Date(thesis.startDate);
    const elapsedText = makeDaysSinceString(startDate);
    assignmentTimeElapsed.textContent = `(${elapsedText})`;
    assignmentDate.textContent = startDate.toLocaleDateString("el-GR");
  }

  // Set other fields
  thesisTopic.textContent = thesis.topic;
  thesisStudent.textContent = thesis.student;
  thesisSummary.textContent = thesis.topicSummary;
  thesisStatus.innerHTML = `
    <span class="badge rounded-pill ${getThesisStatusBootstrapBgClass(
      thesis.status
    )}">
        ${Name.ofThesisStatus(thesis.status)}
    </span>
    `;

  // Download/Preview links
  pdfDownloadBtn.href = descriptionURL;
  pdfPreviewBtn.href = descriptionURL;

  // Send HEAD request to check if the file exists
  fetch(descriptionURL, { method: "HEAD" })
    .then((response) => {
      if (response.ok) {
        pdfDownloadBtn.classList.remove("disabled");
        pdfPreviewBtn.classList.remove("disabled");
      }
    })
    .catch((error) => {
      console.log(error);
    });

  // Add committee members
  committeeList.innerHTML = "";
  for (const member of thesis.committeeMembers) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
        ${member.name}
        <span class="badge rounded-pill ${getMemberRoleBootstrapBgClass(
          member.role
        )}">
        ${Name.ofMemberRole(member.role)}
        </span>
    `;
    committeeList.appendChild(li);

    // Progress bar
    renderThesisStatusProgress(thesis.status);
  }
}
