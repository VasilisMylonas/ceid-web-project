/**
 * Displays a Bootstrap success alert inside the specified element.
 *
 * @param {string} id - The ID of the DOM element where the alert will be rendered.
 * @param {string} title - The title text to display in the alert.
 * @param {string} message - The main message of the alert.
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

/**
 * Displays a Bootstrap-styled error alert in the specified element.
 *
 * @param {string} id - The ID of the DOM element where the alert will be rendered.
 * @param {string} title - The title of the error alert.
 * @param {string} message - The main error message to display.
 * @param {string} details - Additional details to show in a collapsible section.
 */
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

/**
 * Renders a Bootstrap spinner inside the specified element.
 *
 * @param {string} id - The ID of the DOM element where the spinner will be rendered.
 */
function showSpinner(id) {
  const div = document.getElementById(id);
  div.innerHTML = `
    <div class="text-center my-3">
      <div class="spinner-border text-primary" role="status" aria-hidden="true"></div>
      <span class="visually-hidden">Loading...</span>
    </div>
  `;
}
