/**
 * This module contains functions for making API requests to the backend server.
 */

const BASE_URL = "http://localhost:3000/api";
const PROFILE_API_URL = `${BASE_URL}/v1/my/profile`;
const USERS_API_URL = `${BASE_URL}/v1/users`;

async function request(method, url, object = null) {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: object ? JSON.stringify(object) : object,
  });

  // Handle NO_CONTENT
  if (response.status === 204) {
    return;
  }

  const json = await response.json();

  if (response.ok) {
    return json;
  }

  throw new Error(`${response.statusText}: ${json.error.message}`);
}

async function getProfile() {
  return await request("GET", PROFILE_API_URL);
}

async function updateProfile(properties) {
  return await request("PATCH", PROFILE_API_URL, properties);
}

async function getTheses() {
  const theses = await request("GET", `${BASE_URL}/v1/theses`);
  console.log(theses);
}

async function importUsers(users) {
  return await request("PUT", USERS_API_URL, users);
}
