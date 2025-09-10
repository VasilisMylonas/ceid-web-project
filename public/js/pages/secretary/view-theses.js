function thesisStatusName(status) {
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

function memberRoleName(role) {
  switch (role) {
    case "supervisor":
      return "Επιβλέπων";
    case "committee_member":
      return "Μέλος";
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // This check ensures the script only runs on the correct page.
  if (document.getElementById("theses-table-body")) {
    const res = await getTheses();
    console.log(res);
    const thesesData = res.data;

    const tableBody = document.getElementById("theses-table-body");
    const thesisModal = new bootstrap.Modal(
      document.getElementById("thesisDetailsModal")
    );

    // Function to render the table
    function renderTable(theses) {
      tableBody.innerHTML = ""; // Clear existing rows
      theses.forEach((thesis) => {
        const row = document.createElement("tr");
        row.style.cursor = "pointer";
        row.setAttribute("data-thesis-id", thesis.id);

        // TODO
        const statusBadge =
          thesis.status === "active"
            ? `<span class="badge bg-primary">${thesisStatusName(
                thesis.status
              )}</span>`
            : `<span class="badge bg-warning text-dark">${thesisStatusName(
                thesis.status
              )}</span>`;

        row.innerHTML = `
                    <td>${thesis.Topic.title}</td>
                    <td>${thesis.Student.User.name}</td>
                    <td>${thesis.supervisor}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(thesis.startDate).toLocaleDateString(
                      "el-GR"
                    )}</td>
                `;
        tableBody.appendChild(row);
      });
    }

    // Function to show details in the modal
    function showDetails(thesisId) {
      const thesis = thesesData.find((t) => t.id === parseInt(thesisId));
      if (!thesis) return;

      document.getElementById("modal-thesis-topic").textContent =
        thesis.Topic.title;

      const statusElement = document.getElementById("modal-thesis-status");
      const statusBadge =
        thesis.status === "Ενεργή"
          ? `<span class="badge bg-primary">${thesisStatusName(
              thesis.status
            )}</span>`
          : `<span class="badge bg-warning text-dark">${thesisStatusName(
              thesis.status
            )}</span>`;
      statusElement.innerHTML = `Κατάσταση: ${statusBadge}`;

      document.getElementById("modal-thesis-student").textContent =
        thesis.Student.User.name;
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
                    <span class="badge bg-secondary">${memberRoleName(
                      member.role
                    )}</span>
                `;
        committeeList.appendChild(li);
      });

      thesisModal.show();
    }

    // Add event listener to the table body
    tableBody.addEventListener("click", (event) => {
      const row = event.target.closest("tr");
      if (row && row.dataset.thesisId) {
        showDetails(row.dataset.thesisId);
      }
    });

    // Initial render
    renderTable(thesesData);
  }
});
