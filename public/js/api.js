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

/**
 * A special request function for handling file uploads using FormData.
 * It does not set Content-Type, allowing the browser to set it to multipart/form-data.
 */
async function requestWithFile(method, url, formData) {
  const response = await fetch(url, {
    method: method,
    body: formData, // Pass FormData directly
  });

  if (response.status === 204) {
    // No Content
    return;
  }

  // Try to parse JSON, but handle cases where the body might not be JSON
  let errorPayload;
  try {
    errorPayload = await response.json();
    console.debug("API File Response:", errorPayload);
  } catch (e) {
    // If parsing fails, use the raw text of the response
    errorPayload = await response.text();
  }

  if (response.ok) {
    return errorPayload;
  }

  // Improved error message creation
  const errorMessage =
    typeof errorPayload === "object" && errorPayload?.error?.message
      ? errorPayload.error.message
      : JSON.stringify(errorPayload);

  throw new Error(`${response.statusText}: ${errorMessage}`);
}

async function getProfile() {
  return await request("GET", `${BASE_URL}/v1/my/profile`);
}

async function addThesisResources(thesisId, resource) {
  // Expects a single resource object
  return await request(
    "POST",
    `${BASE_URL}/v1/theses/${thesisId}/resources`,
    resource
  );
}

// This function is special because it returns a Blob, not JSON.
async function getThesisDraft(thesisId) {
  const response = await fetch(`${BASE_URL}/v1/theses/${thesisId}/draft`);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return await response.blob();
}

async function getTopicDescription(topicId) {
  const response = await fetch(`${BASE_URL}/v1/topics/${topicId}/description`);
  if (!response.ok) {
    throw new Error(`Failed to download file: ${response.statusText}`);
  }
  return await response.blob();
}
async function createThesisPresentation(thesisId, presentationData) {
  return await request(
    "POST",
    `${BASE_URL}/v1/theses/${thesisId}/presentations`,
    presentationData
  );
}

async function getThesisPresentations(thesisId) {
  return await request(
    "GET",
    `${BASE_URL}/v1/theses/${thesisId}/presentations`
  );
}

async function uploadThesisDraft(thesisId, formData) {
  return await requestWithFile(
    "PUT",
    `${BASE_URL}/v1/theses/${thesisId}/draft`,
    formData
  );
}
async function setNymertesLink(thesisId, link) {
  return await request(
    "PUT",
    `${BASE_URL}/v1/theses/${thesisId}/nemertes-link`,
    { nemertesLink: link }
  );
}

async function getThesisResources(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}/resources`);
}

async function getThesisInvitations(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}/invitations`);
}

async function sendThesisInvitation(thesisId, professorId) {
  return await request(
    "POST",
    `${BASE_URL}/v1/theses/${thesisId}/invitations`,
    { professorId }
  );
}

async function inviteProfessor(thesisId, professorId) {
  return await request(
    "POST",
    `${BASE_URL}/v1/theses/${thesisId}/invitations`,
    { professorId }
  );
}

async function getProfessors() {
  return await request("GET", `${BASE_URL}/v1/users/professors`);
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

//Assignments

async function getStudents() {
  return await request("GET", `${BASE_URL}/v1/users?role=student`);
}

async function getUnderAssignementThesis() {
  return await request("GET", `${BASE_URL}/v1/my/theses?status=under_assignment`);
} 

async function getThesisInvitations(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}/invitations`);
}

async function unassignThesis(thesisId) {
  return await request("DELETE", `${BASE_URL}/v1/theses/${thesisId}`);
}

async function assignTopic(topicId, studentId) {
  return await request("POST", `${BASE_URL}/v1/theses`, { studentId,topicId });
}

async function activateThesis(thesisId) {
  return await request("PATCH", `${BASE_URL}/v1/theses/${thesisId}/status`, { status: "active" });
}