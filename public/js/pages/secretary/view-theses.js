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

function exportTheses(theses) {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  saveToFile(
    JSON.stringify(theses),
    `theses-${today}.json`,
    "application/json"
  );
}

// We need this here cause of bootstrap modal bug
let thesisModal = null;
document.addEventListener("DOMContentLoaded", () => {
  thesisModal = new bootstrap.Modal(
    document.getElementById("thesisDetailsModal")
  );
});

function renderThesisDetails(thesis) {
  document.getElementById("modal-thesis-topic").textContent = thesis.topic;

  const statusElement = document.getElementById("modal-thesis-status");

  statusElement.innerHTML = `
    Κατάσταση:
    <span class="badge ${getThesisStatusBootstrapBgClass(thesis.status)}">
        ${Name.ofThesisStatus(thesis.status)}
    </span>
    `;

  document.getElementById("modal-thesis-student").textContent = thesis.student;
  document.getElementById("modal-thesis-assignment-date").textContent =
    new Date(thesis.startDate).toLocaleDateString("el-GR");
  document.getElementById("modal-thesis-description").textContent =
    thesis.topicSummary;

  const committeeList = document.getElementById("modal-committee-list");

  committeeList.innerHTML = "";

  for (const member of thesis.committeeMembers) {
    const li = document.createElement("li");
    li.className =
      "list-group-item d-flex justify-content-between align-items-center";
    li.innerHTML = `
        ${member.name}
        <span class="badge bg-primary">
            ${Name.ofMemberRole(member.role)}
        </span>
    `;
    committeeList.appendChild(li);
  }

  thesisModal.show();
}

function renderThesisTable(theses) {
  const tableBody = document.getElementById("theses-table-body");
  tableBody.innerHTML = ""; // Clear existing rows

  for (const thesis of theses) {
    const row = document.createElement("tr");
    row.style.cursor = "pointer";
    row.setAttribute("data-thesis-id", thesis.id);
    row.innerHTML = `
    <td>${thesis.topic}</td>
    <td><a href="#">${thesis.student}</a></td>
    <td><a href="#">${thesis.supervisor}</a></td>
    <td>
      <span class="badge ${getThesisStatusBootstrapBgClass(thesis.status)}">
      ${Name.ofThesisStatus(thesis.status)}
      </span>
    </td>
    <td>${new Date(thesis.startDate).toLocaleDateString("el-GR")}</td>
    <td>
      <button class="btn btn-sm btn-primary" aria-label="Προβολή λεπτομερειών διπλωματικής">
        <i class="bi bi-eye-fill"></i>
      </button>
    </td>
    `;
    tableBody.appendChild(row);
  }

  tableBody.addEventListener("click", onShowDetailsClick);
  tableBody
    .querySelector(".btn")
    ?.addEventListener("click", onShowDetailsClick);
}

async function onShowDetailsClick(event) {
  const row = event.target.closest("tr");
  const res = await getThesisDetails(row.dataset.thesisId);
  renderThesisDetails(res.data);
}

const STORAGE_KEY_THESES_PAGE_SIZE = "theses_page_size";
const STORAGE_KEY_THESES_PAGE = "theses_page";

function getPage() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_THESES_PAGE));
}

function getPageSize() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_THESES_PAGE_SIZE));
}

function setPage(page) {
  sessionStorage.setItem(STORAGE_KEY_THESES_PAGE, page);
}

function setPageSize(pageSize) {
  sessionStorage.setItem(STORAGE_KEY_THESES_PAGE_SIZE, pageSize);
}

function createPageNavButton(page, isActive = false) {
  const li = document.createElement("li");
  li.className = "page-item dynamic-page-item";
  li.innerHTML = `
    <button
      type="button"
      class="btn btn-link page-link ${isActive ? "active" : ""}"
      aria-label="Σελίδα ${page}"
    >
      ${page}
    </button>`;
  li.querySelector("button").addEventListener("click", () => {
    setPage(page);
    onReload();
  });
  return li;
}

function renderPageNav(currentPage, totalPages) {
  // Remove previous dynamic page buttons
  const dynamicPageItems = document.querySelectorAll(".dynamic-page-item");
  dynamicPageItems.forEach((item) => item.remove());
  // Add new page buttons
  const fragment = document.createDocumentFragment();

  // Always show first page
  fragment.appendChild(createPageNavButton(1, currentPage === 1));

  // Calculate start and end page for the middle buttons
  let startPage, endPage;
  if (totalPages <= 6) {
    startPage = 2;
    endPage = totalPages - 1;
  } else {
    if (currentPage <= 3) {
      startPage = 2;
      endPage = 5;
    } else if (currentPage >= totalPages - 2) {
      startPage = totalPages - 4;
      endPage = totalPages - 1;
    } else {
      startPage = currentPage - 1;
      endPage = currentPage + 1;
    }
  }

  // Ellipsis after first page if needed
  if (startPage > 2) {
    const ellipsis = document.createElement("li");
    ellipsis.className = "page-item disabled dynamic-page-item";
    ellipsis.innerHTML = `<span class="page-link">...</span>`;
    fragment.appendChild(ellipsis);
  }

  // Middle page buttons (always show 4 middle pages if possible)
  for (let page = startPage; page <= endPage; page++) {
    if (page > 1 && page < totalPages) {
      fragment.appendChild(createPageNavButton(page, currentPage === page));
    }
  }

  // Ellipsis before last page if needed
  if (endPage < totalPages - 1) {
    const ellipsis = document.createElement("li");
    ellipsis.className = "page-item disabled dynamic-page-item";
    ellipsis.innerHTML = `<span class="page-link">...</span>`;
    fragment.appendChild(ellipsis);
  }

  // Always show last page if more than one page
  if (totalPages > 1) {
    fragment.appendChild(
      createPageNavButton(totalPages, currentPage === totalPages)
    );
  }

  // Disable/enable pagination buttons
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

  // Insert the new buttons before the next page button
  const nextPageBtnParent = nextPageBtn.parentElement;
  nextPageBtnParent.parentElement.insertBefore(fragment, nextPageBtnParent);
}

async function onReload() {
  // Set defaults if not set

  if (!sessionStorage.getItem(STORAGE_KEY_THESES_PAGE)) {
    sessionStorage.setItem(STORAGE_KEY_THESES_PAGE, 1);
  }

  if (!sessionStorage.getItem(STORAGE_KEY_THESES_PAGE_SIZE)) {
    sessionStorage.setItem(STORAGE_KEY_THESES_PAGE_SIZE, 10);
  }

  const res = await getThesesSecretary(getPage(), getPageSize());
  renderThesisTable(res.data);

  const page = getPage();
  const pageSize = getPageSize();
  const totalPages = Math.ceil(res.meta.total / pageSize);

  document.getElementById("current-page").textContent = page;
  document.getElementById("total-pages").textContent = totalPages;

  renderPageNav(page, totalPages);
}

function onPageSizeChange() {
  const pageSizeSelect = document.getElementById("page-size-select");

  const newPageSize = parseInt(pageSizeSelect.value);
  const oldPageSize = getPageSize();
  const oldPage = getPage();

  // Recalculate page number to maintain the current item range
  const newPage = Math.floor(((oldPage - 1) * oldPageSize) / newPageSize) + 1;

  setPageSize(newPageSize);
  setPage(newPage);

  onReload();
}

function onPrevPageClick() {
  setPage(getPage() - 1);
  onReload();
}

function onNextPageClick() {
  setPage(getPage() + 1);
  onReload();
}

document.addEventListener("DOMContentLoaded", async () => {
  await onReload();

  const exportThesesButton = document.getElementById("export-theses");
  exportThesesButton.addEventListener("click", () => exportTheses(theses));

  const pageSizeSelect = document.getElementById("page-size-select");
  pageSizeSelect.addEventListener("change", onPageSizeChange);

  const prevPageBtn = document.getElementById("prev-page-btn");
  prevPageBtn.addEventListener("click", onPrevPageClick);

  const nextPageBtn = document.getElementById("next-page-btn");
  nextPageBtn.addEventListener("click", onNextPageClick);

  const searchInput = document.getElementById("search-thesis");
  searchInput.addEventListener("input", (event) => {
    const query = event.target.value.toLowerCase();
    if (query == "") {
      return;
    }

    const filteredTheses = theses.filter(
      (thesis) =>
        thesis.topic.toLowerCase().includes(query) ||
        thesis.student.toLowerCase().includes(query)
    );
    console.log("FILTER");
    renderThesisTable(filteredTheses);
  });
});
