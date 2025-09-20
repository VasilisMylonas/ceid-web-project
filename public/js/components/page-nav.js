function initPageNav(div, onPrevPage, onNextPage, onFirstPage, onLastPage) {
  div.querySelector(".prev-page-btn").addEventListener("click", onPrevPage);
  div.querySelector(".next-page-btn").addEventListener("click", onNextPage);
  div.querySelector(".first-page-btn").addEventListener("click", onFirstPage);
  div.querySelector(".last-page-btn").addEventListener("click", onLastPage);
}

function renderPageNav(div, pageCount, page, itemCount) {
  const nextPageBtn = div.querySelector(".next-page-btn");
  const prevPageBtn = div.querySelector(".prev-page-btn");
  const firstPageBtn = div.querySelector(".first-page-btn");
  const lastPageBtn = div.querySelector(".last-page-btn");

  if (page >= pageCount) {
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

  div.querySelector(".current-page").textContent = page;
  div.querySelector(".page-count").textContent = pageCount;
  div.querySelector(".item-count").textContent = itemCount;
}
