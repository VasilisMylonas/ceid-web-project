function getThesisStatusName(status) {
  switch (status) {
    case "active":
      return "Ενεργή";
    case "under_examination":
      return "Υπό Εξέταση";
    case "completed":
      return "Ολοκληρωμένη";
    case "cancelled":
      return "Ακυρωμένη";
    case "rejected":
      return "Απορριφθείσα";
    case "pending":
      return "Σε Αναμονή";
    case "under_assignment":
      return "Υπό Ανάθεση";
    default:
      return status;
  }
}

function getThesisStatusBootstrapBgClass(status) {
  switch (status) {
    case "active":
      return "bg-success";
    case "rejected":
      return "bg-danger";
    case "under_examination":
      return "bg-warning";
    case "completed":
      return "bg-dark";
    case "cancelled":
      return "bg-dark";
    case "pending":
      return "bg-info";
    case "under_assignment":
      return "bg-warning";
  }
}

function getMemberRoleName(role) {
  switch (role) {
    case "supervisor":
      return "Επιβλέπων";
    case "committee_member":
      return "Μέλος";
  }
}

function renderThesisTable(tableBody, theses) {
  tableBody.innerHTML = ""; // Clear existing rows

  for (const thesis of theses) {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.setAttribute("data-thesis-id", thesis.id);
    row.innerHTML = `
      <td>${thesis.topic}</td>
      <td>${thesis.student}</td>
      <td>${thesis.supervisor}</td>
      <td>
          <span class="badge ${getThesisStatusBootstrapBgClass(thesis.status)}">
          ${getThesisStatusName(thesis.status)}
          </span>
      </td>
      <td>${new Date(thesis.startDate).toLocaleDateString("el-GR")}</td>
      `;
    tableBody.appendChild(row);
  }
}

// Function to show details in the modal
function showDetails(thesisModal, thesisDetails) {
  document.getElementById("modal-thesis-topic").textContent = thesis.topic;

  const statusElement = document.getElementById("modal-thesis-status");
  const statusBadge = `
        <span class="badge ${getThesisStatusBootstrapBgClass(thesis.status)}">
            ${getThesisStatusName(thesis.status)}
        </span>
    `;
  statusElement.innerHTML = `Κατάσταση: ${statusBadge}`;

  document.getElementById("modal-thesis-student").textContent = thesis.student;
  document.getElementById("modal-thesis-assignment-date").textContent =
    new Date(thesis.startDate).toLocaleDateString("el-GR");
  document.getElementById("modal-thesis-description").textContent =
    thesis.Topic.summary;

  const committeeList = document.getElementById("modal-committee-list");
  committeeList.innerHTML = "";
  thesis.CommitteeMembers.forEach((member) => {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
                    ${member.Professor.User.name}
                    <span class="badge bg-secondary">${getMemberRoleName(
                      member.role
                    )}</span>
                `;
    committeeList.appendChild(li);
  });

  thesisModal.show();
}

document.addEventListener("DOMContentLoaded", async function () {
  // This check ensures the script only runs on the correct page.
  if (document.getElementById("theses-table-body")) {
    const tableBody = document.getElementById("theses-table-body");
    const thesisDetailsModal = new bootstrap.Modal(
      document.getElementById("thesisDetailsModal")
    );

    const res = await getTheses();
    const theses = res.data;

    // Add event listener to the table body
    tableBody.addEventListener("click", async (event) => {
      const row = event.target.closest("tr");

      // Get the data-thesis-id attribute
      if (row && row.dataset.thesisId) {
        const res = await getThesisDetails(row.dataset.thesisId);
        const thesisDetails = res.data;
        showDetails(thesisDetailsModal, thesisDetails);
      }
    });

    // Initial render
    renderThesisTable(tableBody, theses);
  }
});
