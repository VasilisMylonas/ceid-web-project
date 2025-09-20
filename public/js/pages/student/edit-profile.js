document.addEventListener("DOMContentLoaded", async () => {
  /**
   * Fetches profile data from the backend.
   * @returns {Promise<object|null>} The user profile data or null on error.
   */
  async function getProfileData() {
    try {
      // The response IS the profile object
      const profile = (await getProfile()).data;

      if (!profile) {
        console.error(
          "getProfileData: Received null or undefined profile from API."
        );
        return null;
      }

      let name = "";
      let surname = "";
      if (profile.name) {
        const nameParts = profile.name.split(" ");
        name = nameParts[0];
        surname = nameParts.slice(1).join(" ");
      }

      return {
        ...profile,
        name: name,
        surname: surname,
        // Extract the student ID from the nested Student object
        studentId: profile.Student ? profile.Student.am : "",
      };
    } catch (error) {
      console.error("Error fetching profile data:", error);
      return null;
    }
  }

  /**
   * Populates the form with user profile data.
   * @param {object} data - The user profile data.
   */
  function populateProfileData(data) {
    if (!data) return;
    // Populate static info
    document.getElementById("student-name").textContent = data.name || "";
    document.getElementById("student-surname").textContent = data.surname || "";
    document.getElementById("student-id").textContent = data.studentId || "";

    // Populate editable info
    document.getElementById("address").value = data.address || "";
    document.getElementById("email").value = data.email || "";
    document.getElementById("phone").value = data.phone || "";
    document.getElementById("landlinePhone").value = data.landlinePhone || "";
  }

  // Load the initial data into the form
  const profileData = await getProfileData();
  populateProfileData(profileData);

  const form = document.getElementById("profile-form");
  if (!form) return;

  // Add these helper functions at the top or before the event listener
  function isValidEmail(email) {
    // Simple email regex
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidPhone(phone) {
    // Accepts 10-digit Greek numbers, allows spaces/dashes
    return /^\d{10}$/.test(phone);
  }

  form.addEventListener("click", async (e) => {
    const button = e.target.closest(".edit-btn");
    if (!button) return;

    const targetInputId = button.dataset.target;
    const input = document.getElementById(targetInputId);
    if (!input) return;

    const isReadOnly = input.hasAttribute("readonly");

    if (isReadOnly) {
      // Save the old value before editing
      input.dataset.oldValue = input.value;
      // Switch to edit mode
      input.removeAttribute("readonly");
      input.focus();
      input.select();

      button.innerHTML = '<i class="bi bi-save"></i>';
      button.classList.remove("btn-outline-secondary");
      button.classList.add("btn-success");
    } else {
      // Validate before sending
      const fieldName = targetInputId;
      const value = input.value.trim();

      if (fieldName === "email" && value && !isValidEmail(value)) {
        alert("Παρακαλώ εισάγετε έγκυρο email.");
        // Restore previous value and exit edit mode
        input.value = input.dataset.oldValue || "";
        input.setAttribute("readonly", true);
        button.innerHTML = '<i class="bi bi-pencil"></i>';
        button.classList.remove("btn-success");
        button.classList.add("btn-outline-secondary");
        return;
      }
      if (
        (fieldName === "phone" || fieldName === "landlinePhone") &&
        value &&
        !isValidPhone(value)
      ) {
        alert("Παρακαλώ εισάγετε έγκυρο αριθμό τηλεφώνου (10 ψηφία).");
        // Restore previous value and exit edit mode
        input.value = input.dataset.oldValue || "";
        input.setAttribute("readonly", true);
        button.innerHTML = '<i class="bi bi-pencil"></i>';
        button.classList.remove("btn-success");
        button.classList.add("btn-outline-secondary");
        return;
      }

      // If valid, switch to read-only and edit mode
      input.setAttribute("readonly", true);
      button.innerHTML = '<i class="bi bi-pencil"></i>';
      button.classList.remove("btn-success");
      button.classList.add("btn-outline-secondary");

      const body = { [fieldName]: value };

      try {
        await updateProfile(body);
        console.log(`Saved ${targetInputId}: ${value}`);
      } catch (error) {
        console.error(`Error saving ${targetInputId}:`, error);
      }
    }
  });
});
