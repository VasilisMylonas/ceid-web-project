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

function renderSupervisorFilter(professors) {
  const supervisorSelect = document.getElementById("filter-supervisor");
  supervisorSelect.innerHTML = '<option value="-1">Όλοι</option>';

  for (const professor of professors) {
    const option = document.createElement("option");
    option.value = professor.id;
    option.textContent = professor.name;
    supervisorSelect.appendChild(option);
  }

  supervisorSelect.value = getSupervisorFilter();
}

const STORAGE_KEY_SECRETARY_THESES_PAGE_SIZE = "sec_theses_page_size";
const STORAGE_KEY_SECRETARY_THESES_PAGE = "sec_theses_page";
const STORAGE_KEY_SECRETARY_THESES_PAGE_COUNT = "sec_theses_page_count";
const STORAGE_KEY_SECRETARY_THESES_SUPERVISOR_FILTER =
  "sec_theses_supervisor_filter";
const STORAGE_KEY_THESES_STATUS_FILTER = "sec_theses_status_filter";
const STORAGE_KEY_THESES_SEARCH_QUERY = "sec_theses_search_query";

function getPage() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE));
}

function getPageSize() {
  return parseInt(
    sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE_SIZE)
  );
}

function getPageCount() {
  return parseInt(
    sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE_COUNT)
  );
}

function setPage(page) {
  sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE, page);
}

function setPageSize(pageSize) {
  sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE_SIZE, pageSize);
}

function setPageCount(pageCount) {
  sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE_COUNT, pageCount);
}

function setSupervisorFilter(supervisorId) {
  sessionStorage.setItem(
    STORAGE_KEY_SECRETARY_THESES_SUPERVISOR_FILTER,
    supervisorId
  );
}

function setSearchQuery(query) {
  sessionStorage.setItem(STORAGE_KEY_THESES_SEARCH_QUERY, query);
}

function getSearchQuery() {
  return sessionStorage.getItem(STORAGE_KEY_THESES_SEARCH_QUERY);
}

function getSupervisorFilter() {
  return parseInt(
    sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_SUPERVISOR_FILTER)
  );
}

function setStatusFilter(status) {
  sessionStorage.setItem(STORAGE_KEY_THESES_STATUS_FILTER, status);
}

function getStatusFilter() {
  return sessionStorage.getItem(STORAGE_KEY_THESES_STATUS_FILTER);
}

function setDefaultValues() {
  if (sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE) === null) {
    sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE, 1);
  }

  if (sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE_SIZE) === null) {
    sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE_SIZE, 10);
  }

  if (
    sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_PAGE_COUNT) === null
  ) {
    sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_PAGE_COUNT, 1);
  }

  if (
    sessionStorage.getItem(STORAGE_KEY_SECRETARY_THESES_SUPERVISOR_FILTER) ===
    null
  ) {
    sessionStorage.setItem(STORAGE_KEY_SECRETARY_THESES_SUPERVISOR_FILTER, -1);
  }

  if (sessionStorage.getItem(STORAGE_KEY_THESES_STATUS_FILTER) === null) {
    sessionStorage.setItem(STORAGE_KEY_THESES_STATUS_FILTER, "");
  }

  if (sessionStorage.getItem(STORAGE_KEY_THESES_SEARCH_QUERY) === null) {
    sessionStorage.setItem(STORAGE_KEY_THESES_SEARCH_QUERY, "");
  }
}

function renderThesisTableSpinner() {
  const tableBody = document.getElementById("theses-table-body");
  tableBody.innerHTML = `
  <tr>
    <td colspan="6" class="text-center" style="height: 300px;">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </td>
  </tr>
  `;
}

function renderPageNavButtons(page, totalPages, totalItems) {
  const nextPageBtn = document.getElementById("next-page-btn");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const firstPageBtn = document.getElementById("first-page-btn");
  const lastPageBtn = document.getElementById("last-page-btn");

  if (page >= totalPages) {
    nextPageBtn.classList.add("disabled");
    lastPageBtn.classList.add("disabled");
  } else {
    nextPageBtn.classList.remove("disabled");
    lastPageBtn.classList.remove("disabled");
  }

  if (page <= 1) {
    prevPageBtn.classList.add("disabled");
    firstPageBtn.classList.add("disabled");
  } else {
    prevPageBtn.classList.remove("disabled");
    firstPageBtn.classList.remove("disabled");
  }

  document.getElementById("current-page").textContent = page;
  document.getElementById("total-pages").textContent = totalPages;
  document.getElementById("item-count").textContent = totalItems;
}

async function onReload() {
  // Set defaults if not set
  setDefaultValues();

  const page = getPage();
  const pageSize = getPageSize();
  const supervisorId = getSupervisorFilter();
  const status = getStatusFilter();
  const searchQuery = getSearchQuery();

  renderThesisTableSpinner();

  const theses = await getThesesSecretary(
    page,
    pageSize,
    supervisorId < 0 ? undefined : parseInt(supervisorId),
    status === "" ? undefined : status,
    searchQuery === "" ? undefined : searchQuery
  );
  await delay(200);

  renderThesisTable(theses.data);

  setPageCount(Math.ceil(theses.meta.total / pageSize));
  const totalPages = getPageCount();

  renderPageNavButtons(page, totalPages, theses.meta.total);
}

async function onPageSizeChange() {
  const pageSizeSelect = document.getElementById("page-size-select");

  const newPageSize = parseInt(pageSizeSelect.value);
  const oldPageSize = getPageSize();
  const oldPage = getPage();

  // Recalculate page number to maintain the current item range
  const newPage = Math.floor(((oldPage - 1) * oldPageSize) / newPageSize) + 1;

  setPageSize(newPageSize);
  setPage(newPage);

  await onReload();
}

async function onPrevPageClick(event) {
  setPage(getPage() - 1);
  await onReload();
}

async function onNextPageClick(event) {
  setPage(getPage() + 1);
  await onReload();
}

async function onFirstPageClick(event) {
  setPage(1);
  await onReload();
}

async function onLastPageClick(event) {
  setPage(getPageCount());
  await onReload();
}

async function onShowDetailsClick(event) {
  const row = event.target.closest("tr");
  const res = await getThesisDetails(row.dataset.thesisId);
  renderThesisDetails(res.data);
}

async function onSupervisorSelectChange(event) {
  setSupervisorFilter(event.target.value);
  setPage(1);
  await onReload();
}

async function onStatusSelectChange(event) {
  setStatusFilter(event.target.value);
  setPage(1);
  await onReload();
}

async function onSearchInputChange(event) {
  setSearchQuery(event.target.value);
  setPage(1);
  await onReload();
}

async function onFilterFormSubmit(event) {
  event.preventDefault();
  setPage(1);
  setSearchQuery(event.target.search.value);
  await onReload();
}

document.addEventListener("DOMContentLoaded", async () => {
  const exportThesesButton = document.getElementById("export-theses");
  const pageSizeSelect = document.getElementById("page-size-select");
  const prevPageBtn = document.getElementById("prev-page-btn");
  const nextPageBtn = document.getElementById("next-page-btn");
  const firstPageBtn = document.getElementById("first-page-btn");
  const lastPageBtn = document.getElementById("last-page-btn");
  const filterSupervisor = document.getElementById("filter-supervisor");
  const filterStatus = document.getElementById("filter-status");
  const searchInput = document.getElementById("search");
  const filters = document.getElementById("filters");

  const professors = await getAllProfessors();
  renderSupervisorFilter(professors.data);

  filterStatus.status = getStatusFilter();
  filterSupervisor.value = getSupervisorFilter();
  searchInput.value = getSearchQuery();

  await onReload();

  exportThesesButton.addEventListener("click", () => exportTheses(theses));
  pageSizeSelect.addEventListener("change", onPageSizeChange);
  prevPageBtn.addEventListener("click", onPrevPageClick);
  nextPageBtn.addEventListener("click", onNextPageClick);
  firstPageBtn.addEventListener("click", onFirstPageClick);
  lastPageBtn.addEventListener("click", onLastPageClick);
  filterSupervisor.addEventListener("change", onSupervisorSelectChange);
  filterStatus.addEventListener("change", onStatusSelectChange);
  searchInput.addEventListener("input", onSearchInputChange);
  filters.addEventListener("submit", onFilterFormSubmit);
});
