/**
 * This module contains functions for making API requests to the backend server.
 */

const BASE_URL = "http://localhost:3000/api";

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
  return await request("GET", `${BASE_URL}/v1/my/profile`);
}

async function updateProfile(properties) {
  return await request("PATCH", `${BASE_URL}/v1/my/profile`, properties);
}

async function getThesesSecretary() {
  return await request(
    "GET",
    `${BASE_URL}/v1/theses?status=active&status=under_examination`
  );
}

async function getThesisDetails(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}`);
}

async function importUsers(users) {
  return await request("POST", `${BASE_URL}/v1/users/batch`, users);
}
