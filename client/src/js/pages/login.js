import { login } from "/js/api.js";
import { jwtDecode } from "jwt-decode";

document
  .getElementById("loginForm")
  .addEventListener("submit", onLoginFormSubmit);

async function onLoginFormSubmit(e) {
  e.preventDefault(); // Prevent redirect

  const loginAlert = document.getElementById("loginAlert");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const token = await login(username, password);

    // Save the token to session storage (it gets cleared when closing the tab)
    // NOTE: an alternative is HttpOnly cookie which is more secure but requires
    // CORS and CSRF protection on the server
    sessionStorage.setItem("authToken", token);
    loginAlert.classList.add("d-none");

    const { id, role } = jwtDecode(token);
    console.log(`Welcome user ${id} (${role})`);

    // Redirect to appropriate page
    window.location.href = `/${role}.html`;
  } catch (error) {
    // We could also change the message to show the actual error
    // But for security reasons we avoid giving details on why the login failed
    // const loginAlertMessage = document.getElementById("loginAlertMessage");
    // loginAlertMessage.textContent = error.message;
    loginAlert.classList.remove("d-none");
  }
}
