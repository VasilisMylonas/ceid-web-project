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
const STORAGE_KEY_THESES_PAGE_COUNT = "theses_page_count";

function getPage() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_THESES_PAGE));
}

function getPageSize() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_THESES_PAGE_SIZE));
}

function getPageCount() {
  return parseInt(sessionStorage.getItem(STORAGE_KEY_THESES_PAGE_COUNT));
}

function setPage(page) {
  sessionStorage.setItem(STORAGE_KEY_THESES_PAGE, page);
}

function setPageSize(pageSize) {
  sessionStorage.setItem(STORAGE_KEY_THESES_PAGE_SIZE, pageSize);
}

function setPageCount(pageCount) {
  sessionStorage.setItem(STORAGE_KEY_THESES_PAGE_COUNT, pageCount);
}

function renderSupervisorOptions(professors) {
  const supervisorSelect = document.getElementById("supervisor-select");
  supervisorSelect.innerHTML = '<option value="">Όλοι</option>';

  for (const professor of professors) {
    const option = document.createElement("option");
    option.value = professor.id;
    option.textContent = professor.name;
    supervisorSelect.appendChild(option);
  }
}

async function onReload() {
  // Set defaults if not set

  if (!sessionStorage.getItem(STORAGE_KEY_THESES_PAGE)) {
    const urlParams = new URLSearchParams(window.location.search);
    const pageFromUrl = parseInt(urlParams.get("page"));
    if (!isNaN(pageFromUrl) && pageFromUrl > 0) {
      sessionStorage.setItem(STORAGE_KEY_THESES_PAGE, pageFromUrl);
    } else {
      sessionStorage.setItem(STORAGE_KEY_THESES_PAGE, 1);
    }
  }

  if (!sessionStorage.getItem(STORAGE_KEY_THESES_PAGE_SIZE)) {
    sessionStorage.setItem(STORAGE_KEY_THESES_PAGE_SIZE, 10);
  }

  const page = getPage();
  const pageSize = getPageSize();

  const theses = await getThesesSecretary(page, pageSize);
  setPageCount(Math.ceil(theses.meta.total / pageSize));

  const totalPages = getPageCount();

  renderThesisTable(theses.data);

  // todo
  // const professors = await getAllProfessors();
  // renderSupervisorOptions(professors.data);

  document.getElementById("current-page").textContent = page;
  document.getElementById("total-pages").textContent = totalPages;
  document.getElementById("item-count").textContent = theses.meta.total;

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

async function onPrevPageClick() {
  setPage(getPage() - 1);
  await onReload();
}

async function onNextPageClick() {
  setPage(getPage() + 1);
  await onReload();
}

async function onFirstPageClick() {
  setPage(1);
  await onReload();
}

async function onLastPageClick() {
  setPage(getPageCount());
  await onReload();
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

  const firstPageBtn = document.getElementById("first-page-btn");
  firstPageBtn.addEventListener("click", onFirstPageClick);

  const lastPageBtn = document.getElementById("last-page-btn");
  lastPageBtn.addEventListener("click", onLastPageClick);

  // const searchInput = document.getElementById("search-thesis");
  // searchInput.addEventListener("input", (event) => {
  //   const query = event.target.value.toLowerCase();
  //   if (query == "") {
  //     return;
  //   }

  //   const filteredTheses = theses.filter(
  //     (thesis) =>
  //       thesis.topic.toLowerCase().includes(query) ||
  //       thesis.student.toLowerCase().includes(query)
  //   );
  //   console.log("FILTER");
  //   renderThesisTable(filteredTheses);
  // });
});
