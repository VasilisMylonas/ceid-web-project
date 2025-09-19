const state = {
  page: 1,
  pageSize: 10,
  pageCount: 0,
  statusFilter: "all",
  roleFilter: "all",
  searchQuery: "",
};

async function setState(newState) {
  newState = { ...state, ...newState }; // Merge with existing state
  await onStateUpdate(newState);
  Object.assign(state, newState); // Update state
  localStorage.setItem("thesesListState", JSON.stringify(state));
  console.log("State updated:", state);
}

async function loadState() {
  const savedState = localStorage.getItem("thesesListState");
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
    roleFilter: event.target.elements.role.value,
    page: 1,
  });
}

async function onFiltersReset(event) {
  await setState({
    searchQuery: "",
    statusFilter: "all",
    roleFilter: "all",
    page: 1,
  });
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
  console.log(newState.pageSize);

  const theses = await getMyTheses(
    newState.page,
    newState.pageSize,
    newState.statusFilter === "all" ? null : newState.statusFilter,
    newState.searchQuery || null,
    newState.roleFilter === "all" ? null : newState.roleFilter
  );

  const cardListDiv = document.getElementById("theses-card-list");
  const pageNavDiv = document.getElementById("page-nav-container");

  newState.pageCount = Math.max(
    1,
    Math.ceil(theses.meta.total / newState.pageSize)
  );

  renderPageSizeSelect(newState.pageSize);
  renderStatusFilter(newState.statusFilter);
  renderRoleFilter(newState.roleFilter);
  renderThesesCards(cardListDiv, theses.data);
  renderPageNav(
    pageNavDiv,
    newState.pageCount,
    newState.page,
    theses.meta.count
  );
}

function renderThesesCards(div, theses) {
  div.innerHTML = "";
  theses.forEach((thesis) => {
    const card = document.createElement("div");
    card.className = "col";
    card.innerHTML = `
      <article class="card h-100">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title mb-3 fw-semibold text-primary">${
            thesis.topic
          }</h5>
          <ul class="list-unstyled mb-4 small">
            <li class="mb-1">
                <i class="bi bi-person-fill me-1 text-secondary"></i>
                <strong>Φοιτητής:</strong> <span>${thesis.student}</span>
            </li>
            <li class="mb-1">
                <i class="bi bi-person-badge-fill me-1 text-secondary"></i>
                <strong>Επιβλέπων:</strong> <span>${thesis.supervisor}</span>
            </li>
            <li class="mb-1">
                <i class="bi bi-info-circle-fill me-1 text-secondary"></i>
                <strong>Κατάσταση:</strong> <span class="rounded-pill badge ${getThesisStatusBootstrapBgClass(
                  thesis.status
                )} border">${Name.ofThesisStatus(thesis.status)}</span>
            </li>
            <li>
                <i class="bi bi-calendar-event-fill me-1 text-secondary"></i>
                <strong>Ημ. Ανάθεσης:</strong> <span class="text-dark">${
                  thesis.startDate
                    ? new Date(thesis.startDate).toLocaleDateString("el-GR")
                    : "Αναμένεται"
                }</span>
            </li>
          </ul>
          <div class="mt-auto d-flex gap-2 justify-content-end">
            <button class="btn btn-sm btn-primary"
                data-thesis-id="${thesis.id}"
                data-bs-toggle="modal"
                data-bs-target="#thesisDetailsModal">
              <i class="bi bi-eye-fill me-1" aria-hidden="true"></i>Λεπτομέρειες
          </div>
        </div>
      </article>
    `;
    div.appendChild(card);
  });
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

function renderRoleFilter(value) {
  const roleSelect = document.getElementById("role-select");
  roleSelect.innerHTML = `<option value="all">Όλοι οι ρόλοι</option>`;

  const roles = ["supervisor", "committee_member"];

  for (const role of roles) {
    const option = document.createElement("option");
    option.value = role;
    option.textContent = Name.ofMemberRole(role);
    roleSelect.appendChild(option);
  }

  roleSelect.value = value;
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
