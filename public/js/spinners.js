/*
    Utility function to show a loading spinner using Bootstrap styles

    Create a <div> with a specific id in the HTML where the spinner will be shown.
    Call showSpinner with the id of the div.
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
