/**
 * This module contains functions for making API requests to the backend server.
 */

const BASE_URL = "http://localhost:3000/api";
const PROFILE_API_URL = `${BASE_URL}/v1/my/profile`;

async function request(method, url, object = null) {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: object ? JSON.stringify(object) : object,
  });

  if (response.ok) {
    return await response.json();
  }

  throw new Error(`${response.status} ${response.statusText}`);
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
