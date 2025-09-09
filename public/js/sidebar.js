// Apply sidebar-collapsed to documentElement (html) so that it doesn't flash
// with the wrong state on page load (body may not have loaded yet)

const STORAGE_KEY_COLLAPSED = "sidebar-collapsed";
const STORAGE_KEY_THEME = "dark-mode";

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

function toggleTheme() {
  const theme = document.documentElement.getAttribute("data-bs-theme");
  const themeIcon = document.getElementById("theme-icon");

  if (theme === "dark") {
    document.documentElement.setAttribute("data-bs-theme", "light");
    localStorage.setItem(STORAGE_KEY_THEME, "light");
    themeIcon.classList.remove("bi-moon-fill");
    themeIcon.classList.add("bi-moon");
  } else {
    document.documentElement.setAttribute("data-bs-theme", "dark");
    localStorage.setItem(STORAGE_KEY_THEME, "dark");
    themeIcon.classList.remove("bi-moon");
    themeIcon.classList.add("bi-moon-fill");
  }
}

// Apply collapsed state on page load
if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === "true") {
  document.documentElement.classList.add("sidebar-collapsed");
} else {
  document.documentElement.classList.remove("sidebar-collapsed");
}

// Apply dark mode state on page load
if (localStorage.getItem(STORAGE_KEY_THEME) === "dark") {
  document.documentElement.setAttribute("data-bs-theme", "dark");
} else {
  document.documentElement.setAttribute("data-bs-theme", "light");
}

document.addEventListener("DOMContentLoaded", () => {
  const themeIcon = document.getElementById("theme-icon");
  if (localStorage.getItem(STORAGE_KEY_THEME) === "dark") {
    themeIcon.classList.remove("bi-moon");
    themeIcon.classList.add("bi-moon-fill");
  } else {
    themeIcon.classList.remove("bi-moon-fill");
    themeIcon.classList.add("bi-moon");
  }

  const sidebarToggleButton = document.getElementById("sidebar-toggle");
  sidebarToggleButton.addEventListener("click", toggleSidebar);

  const logoutButton = document.getElementById("logout");
  logoutButton.addEventListener("click", logout);

  const themeToggleButton = document.getElementById("theme-toggle");
  themeToggleButton.addEventListener("click", toggleTheme);
});
