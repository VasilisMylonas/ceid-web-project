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

async function getThesis(){
  return await request("GET", `${BASE_URL}/v1/my/thesis`);
}

async function getTopic(id){
  return await request ("GET", `${BASE_URL}/v1/topics/${id}`);
}

async function getThesesSecretary(
  page,
  pageSize,
  supervisorId = null,
  status = null,
  query = null
) {
  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);

  const offset = (page - 1) * pageSize;
  const limit = pageSize;

  return await request(
    "GET",
    `${BASE_URL}/v1/theses?&offset=${offset}&limit=${limit}${
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

//Professor APIs

//Topic Management
async function getMyUnassignedTopics() {
  return await request("GET", `${BASE_URL}/v1/my/topics?status=unassigned`);
}

async function createThesisTopic({ title, summary }) {
  return await request("POST", `${BASE_URL}/v1/topics`, { title, summary });
}

async function updateThesisTopic(id, { title, summary }) {
  return await request("PUT", `${BASE_URL}/v1/topics/${id}`, { title, summary });
}


async function putTopicDescription(topicId, file) {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`/topics/${topicId}/description`, {
    method: "PUT",
    body: form,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed with ${res.status}: ${text}`);
  }

  return res;
}

//Assignments