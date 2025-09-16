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

  console.debug("API Response:", json);

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

async function getAllProfessors() {
  return await request("GET", `${BASE_URL}/v1/users?role=professor`);
}

async function getThesis() {
  return await request("GET", `${BASE_URL}/v1/my/thesis`);
}

async function getTopic(id) {
  return await request("GET", `${BASE_URL}/v1/topics/${id}`);
}

async function getThesesSecretary(
  page,
  pageSize,
  supervisorId = null,
  status = null,
  query = null
) {
  let offset;
  let limit;

  if (page == null || pageSize == null) {
    offset = 0;
    limit = null;
  } else {
    page = parseInt(page, 10);
    pageSize = parseInt(pageSize, 10);
    offset = (page - 1) * pageSize;
    limit = pageSize;
  }

  return await request(
    "GET",
    `${BASE_URL}/v1/theses?&offset=${offset}${limit ? `&limit=${limit}` : ""}${
      supervisorId ? `&professorId=${supervisorId}&role=supervisor` : ""
    }${status ? `&status=${status}` : ""}${
      query ? `&q=${encodeURIComponent(query)}` : ""
    }`
  );
}

async function getThesisDetails(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}`);
}

async function importUsers(users) {
  return await request("POST", `${BASE_URL}/v1/users/batch`, users);
}

async function approveThesis(thesisId, assemblyNumber, protocolNumber) {
  return await request("POST", `${BASE_URL}/v1/theses/${thesisId}/approve`, {
    assemblyNumber,
    protocolNumber,
  });
}

async function cancelThesis(thesisId, assemblyNumber, reason) {
  return await request("POST", `${BASE_URL}/v1/theses/${thesisId}/cancel`, {
    assemblyNumber,
    reason,
  });
}

async function completeThesis(thesisId) {
  return await request("POST", `${BASE_URL}/v1/theses/${thesisId}/complete`);
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
