import { login } from "/js/lib.js";

document
  .getElementById("loginForm")
  .addEventListener("submit", onLoginFormSubmit);

async function onLoginFormSubmit(e) {
  e.preventDefault();
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const token = await login(username, password);
    console.log("Received token:", token);
  } catch (error) {
    const loginError = document.getElementById("loginError");
    loginError.classList.remove("d-none");
    console.error("Login failed:", error);
    return;
  }
}
