function onDataEntryFormSubmit(event) {
  event.preventDefault();

  const file = event.target.file.files[0];

  console.log(file);

  const fileReader = new FileReader();
  fileReader.readAsText(file);

  fileReader.onload = async () => {
    try {
      showSpinner("result");
      await delay(250); // allow spinner to render
      await importUsers(JSON.parse(fileReader.result));
      showSuccessAlert(
        "result",
        "Επιτυχής Εισαγωγή Δεδομένων",
        "Τα δεδομένα εισήχθησαν με επιτυχία."
      );
    } catch (error) {
      showErrorAlert(
        "result",
        "Σφάλμα εισαγωγής δεδομένων",
        "Παρουσιάστηκε πρόβλημα κατά την εισαγωγή. Ελέγξτε το αρχείο JSON και προσπαθήστε ξανά.",
        error.message
      );
    } finally {
      event.target.file.value = "";
    }
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const dataEntryForm = document.getElementById("data-entry-form");
  dataEntryForm.addEventListener("submit", onDataEntryFormSubmit);
});
