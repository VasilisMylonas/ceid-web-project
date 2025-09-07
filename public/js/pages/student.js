// Sidebar collapse functionality
(function () {
  const body = document.body;
  const toggleButton = document.getElementById("sidebar-toggle");
  const STORAGE_KEY_COLLAPSED = "sidebar-collapsed";

  // Apply collapsed state on page load
  if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === "true") {
    body.classList.add("sidebar-collapsed");
  }

  // Toggle sidebar on button click
  if (toggleButton) {
    toggleButton.addEventListener("click", () => {
      body.classList.toggle("sidebar-collapsed");
      // Save the state to localStorage
      localStorage.setItem(
        STORAGE_KEY_COLLAPSED,
        body.classList.contains("sidebar-collapsed")
      );
    });
  }
})();
