/*
    Utility functions to show alerts using Bootstrap styles

    Create a <div> with a specific id in the HTML where the alert will be shown.
    Call showSuccessAlert or showErrorAlert with the id of the div, title, message and details (for errors).
*/

function showSuccessAlert(id, title, message) {
  const div = document.getElementById(id);
  div.innerHTML = `
        <article class="alert alert-success alert-dismissible" role="alert">
          <h5 class="d-flex align-items-center mb-2">
            <i class="bi bi-check-circle-fill me-2" aria-hidden="true"></i>
            <strong>${title}</strong>
          </h5>
          <p class="mb-0">${message}</p>
          <button type="button" class="btn-close" data-bs-dismiss="alert"
              aria-label="Κλείσιμο"></button>
        </article>
      `;
}

function showErrorAlert(id, title, message, details) {
  const div = document.getElementById(id);
  div.innerHTML = `
        <article class="alert alert-danger alert-dismissible" role="alert">
          <h5 class="d-flex align-items-center mb-2">
            <i class="bi bi-exclamation-triangle-fill me-2"
                aria-hidden="true"></i>
            <strong>${title}</strong>
          </h5>
          <p>${message}</p>
          <button class="btn btn-link p-0" type="button"
              data-bs-toggle="collapse" data-bs-target="#${id}-details"
              aria-expanded="false" aria-controls="${id}-details">
            Προβολή λεπτομερειών
          </button>
          <button type="button" class="btn-close" data-bs-dismiss="alert"
              aria-label="Κλείσιμο"></button>
          <div class="collapse mt-2" id="${id}-details">
            ${details}
          </div>
        </article>
      `;
}
