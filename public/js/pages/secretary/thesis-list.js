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
      <span class="badge rounded-pill ${getThesisStatusBootstrapBgClass(
        thesis.status
      )}">
      ${Name.ofThesisStatus(thesis.status)}
      </span>
    </td>
    <td>${
      thesis.startDate == null
        ? "-"
        : new Date(thesis.startDate).toLocaleDateString("el-GR")
    }</td>
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

// We need this here cause of bootstrap modal bug
let thesisModal = null;
document.addEventListener("DOMContentLoaded", () => {
  thesisModal = new bootstrap.Modal(
    document.getElementById("thesisDetailsModal")
  );
});

async function onShowDetailsClick(event) {
  const row = event.target.closest("tr");
  const res = await getThesisDetails(row.dataset.thesisId);
  renderThesisDetails(res.data);
  renderThesisActions(res.data);
  thesisModal.show();
}

const state = {
  page: 1,
  pageSize: 10,
  pageCount: 0,
  statusFilter: "all",
  supervisorFilter: -1,
  searchQuery: "",
};

const STATE_KEY = "thesesListStateSecretary";

async function setState(newState) {
  newState = { ...state, ...newState }; // Merge with existing state
  await onStateUpdate(newState);
  Object.assign(state, newState); // Update state
  localStorage.setItem(STATE_KEY, JSON.stringify(state));
  console.log("State updated:", state);
}

async function loadState() {
  const savedState = localStorage.getItem(STATE_KEY);
  if (savedState) {
    Object.assign(state, JSON.parse(savedState));
  }
}

async function onFiltersSubmit(event) {
  event.preventDefault();

  // event.target is the form element
  await setState({
    searchQuery: event.target.elements.search.value,
    statusFilter: event.target.elements.status.value,
    supervisorFilter: parseInt(event.target.elements.supervisor.value),
    page: 1,
  });
}

async function onFiltersReset(event) {
  await setState({
    searchQuery: "",
    statusFilter: "all",
    supervisorFilter: -1,
    page: 1,
  });
}

async function onExportJsonClick(event) {
  event.preventDefault();

  const theses = await getThesesSecretary(
    state.page,
    state.pageSize,
    state.supervisorFilter === -1 ? null : state.supervisorFilter,
    state.statusFilter === "all" ? null : state.statusFilter,
    state.searchQuery || null
  );

  exportThesesToJSON(theses.data);
}

async function onExportCsvClick(event) {
  event.preventDefault();

  const theses = await getThesesSecretary(
    state.page,
    state.pageSize,
    state.supervisorFilter === -1 ? null : state.supervisorFilter,
    state.statusFilter === "all" ? null : state.statusFilter,
    state.searchQuery || null
  );

  exportThesesCSV(theses.data);
}

async function onPageSizeChange(event) {
  const newPageSize = parseInt(event.target.value);

  await setState({
    pageSize: newPageSize,
    // Recalculate page number to maintain the current item range
    page: Math.floor(((state.page - 1) * state.pageSize) / newPageSize) + 1,
  });
}

// Called whenever state is updated
async function onStateUpdate(newState) {
  const theses = await getThesesSecretary(
    newState.page,
    newState.pageSize,
    newState.supervisorFilter === -1 ? null : newState.supervisorFilter,
    newState.statusFilter === "all" ? null : newState.statusFilter,
    newState.searchQuery || null
  );

  const thesesTableBody = document.getElementById("theses-table-body");
  const pageNavDiv = document.getElementById("page-nav-container");

  newState.pageCount = Math.max(
    1,
    Math.ceil(theses.meta.total / newState.pageSize)
  );

  const professors = await getProfessors();

  renderThesisTableSpinner();

  // Re render UI
  renderPageSizeSelect(newState.pageSize);
  renderStatusFilter(newState.statusFilter);
  renderSupervisorFilter(professors.data, newState.supervisorFilter);
  renderThesisTable(thesesTableBody, theses.data);
  renderPageNav(
    pageNavDiv,
    newState.pageCount,
    newState.page,
    theses.meta.total
  );
}

function renderStatusFilter(value) {
  const statusSelect = document.getElementById("status-select");
  statusSelect.innerHTML = `<option value="all">Όλες</option>`;

  const statuses = [
    "active",
    "under_examination",
    "completed",
    "cancelled",
    "under_assignment",
  ];

  for (const status of statuses) {
    const option = document.createElement("option");
    option.value = status;
    option.textContent = Name.ofThesisStatus(status);
    statusSelect.appendChild(option);
  }

  statusSelect.value = value;
}

function renderSupervisorFilter(professors, supervisorId) {
  const supervisorSelect = document.getElementById("supervisor-select");
  supervisorSelect.innerHTML = `<option value="-1">Όλοι</option>`;

  for (const professor of professors) {
    const option = document.createElement("option");
    option.value = professor.professorId;
    option.textContent = professor.name;
    supervisorSelect.appendChild(option);
  }

  supervisorSelect.value = supervisorId;
}

function renderPageSizeSelect(value) {
  const pageSizeSelect = document.getElementById("page-size-select");
  pageSizeSelect.innerHTML = "";

  const pageSizes = [10, 25, 50, 100];

  for (const size of pageSizes) {
    const option = document.createElement("option");
    option.value = size;
    option.textContent = `${size} ανά σελίδα`;
    pageSizeSelect.appendChild(option);
  }

  pageSizeSelect.value = value;
}

async function onLoad() {
  // Load saved state
  loadState();

  // Initialize event listeners

  const pageSizeSelect = document.getElementById("page-size-select");
  pageSizeSelect.addEventListener("change", onPageSizeChange);

  const filters = document.getElementById("filters");
  filters.addEventListener("submit", onFiltersSubmit);
  filters.addEventListener("reset", onFiltersReset);

  const exportJsonBtn = document.getElementById("export-json-btn");
  exportJsonBtn.addEventListener("click", onExportJsonClick);

  const exportCsvBtn = document.getElementById("export-csv-btn");
  exportCsvBtn.addEventListener("click", onExportCsvClick);

  initPageNav(
    document.getElementById("page-nav-container"),
    () => setState({ page: state.page - 1 }),
    () => setState({ page: state.page + 1 }),
    () => setState({ page: 1 }),
    () => setState({ page: state.pageCount })
  );

  // Trigger first load
  await setState(state);
}

document.addEventListener("DOMContentLoaded", onLoad);
