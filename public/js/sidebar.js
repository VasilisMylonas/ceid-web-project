// Apply sidebar-collapsed to documentElement (html) so that it doesn't flash
// with the wrong state on page load (body may not have loaded yet)

const STORAGE_KEY_COLLAPSED = "sidebar-collapsed";

function toggleSidebar() {
  document.documentElement.classList.toggle("sidebar-collapsed");

  // Save the state to localStorage
  localStorage.setItem(
    STORAGE_KEY_COLLAPSED,
    document.documentElement.classList.contains("sidebar-collapsed")
  );
}

function logout() {
  if (!confirm("Είστε σίγουροι ότι θέλετε να αποσυνδεθείτε;")) {
    return;
  }

  fetch("/logout", { method: "POST" }).then(() => {
    window.location.href = "/";
  });
}

// Apply collapsed state on page load
if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === "true") {
  document.documentElement.classList.add("sidebar-collapsed");
}

document.addEventListener("DOMContentLoaded", () => {
  const toggleButton = document.getElementById("sidebar-toggle");
  toggleButton.addEventListener("click", toggleSidebar);

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", logout);
});
