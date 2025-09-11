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

async function getThesesSecretary(page, pageSize) {
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);

  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  return await request(
    "GET",
    `${BASE_URL}/v1/theses?status=active&status=under_examination&offset=${offset}&limit=${limit}`
  );
}

async function getAllProfessors() {
  return await request("GET", `${BASE_URL}/v1/professors`);
}

async function getThesisDetails(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}`);
}

async function importUsers(users) {
  return await request("POST", `${BASE_URL}/v1/users/batch`, users);
}

class Name {
  static ofThesisStatus(status) {
    switch (status) {
      case "active":
        return "Ενεργή";
      case "under_examination":
        return "Υπό Εξέταση";
      case "completed":
        return "Ολοκληρωμένη";
      case "cancelled":
        return "Ακυρωμένη";
      case "rejected":
        return "Απορριφθείσα";
      case "pending":
        return "Σε Αναμονή";
      case "under_assignment":
        return "Υπό Ανάθεση";
    }
  }

  static ofMemberRole(role) {
    switch (role) {
      case "supervisor":
        return "Επιβλέπων";
      case "committee_member":
        return "Μέλος";
    }
  }
}
