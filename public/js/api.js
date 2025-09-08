/**
 * This module contains functions for making API requests to the backend server.
 */

const BASE_URL = "http://localhost:3000/api";
const PROFILE_API_URL = `${BASE_URL}/v1/my/profile`;

async function request(method, url, object = {}) {
  const response = await fetch(url, {
    method: method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(object),
  });

  if (response.ok) {
    return await response.json();
  }

  throw new Error(`${response.status} ${response.statusText}`);
}

export async function getProfile() {
  return await request("GET", PROFILE_API_URL);
}

export async function updateProfile(properties) {
  return await request("PATCH", PROFILE_API_URL, properties);
}
