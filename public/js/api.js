/**
 * This module contains functions for making API requests to the backend server.
 */

// Same origin
const BASE_URL = "/api";

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

function pageToLimitOffset(page, pageSize) {
  if (page == null || pageSize == null) {
    return {
      offset: 0,
      limit: null,
    };
  }

  page = parseInt(page, 10);
  pageSize = parseInt(pageSize, 10);
  return {
    offset: (page - 1) * pageSize,
    limit: pageSize,
  };
}

async function getMyTheses(
  page,
  pageSize,
  status = null,
  query = null,
  role = null
) {
  const { offset, limit } = pageToLimitOffset(page, pageSize);
  return await request(
    "GET",
    `${BASE_URL}/v1/my/theses?&offset=${offset}${
      limit ? `&limit=${limit}` : ""
    }${status ? `&status=${status}` : ""}${
      query ? `&q=${encodeURIComponent(query)}` : ""
    }${role ? `&role=${role}` : ""}`
  );
}

async function getThesisDetails(thesisId) {
  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}`);
}

//
// Secretary
//

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

//
// Name mappings and misc
//

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

  static ofInvitationResponse(response) {
    switch (response) {
      case "accepted":
        return "Αποδεκτή";
      case "rejected":
        return "Απορριφθείσα";
      case "pending":
        return "Εκκρεμεί";
    }
  }
}

function getMemberRoleBootstrapBgClass(role) {
  switch (role) {
    case "supervisor":
      return "bg-primary";
    case "committee_member":
      return "bg-secondary";
  }
}

function getThesisStatusBootstrapBgClass(status) {
  switch (status) {
    case "active":
      return "bg-success";
    case "completed":
      return "bg-success";
    case "cancelled":
      return "bg-danger";
    case "under_examination":
      return "bg-warning";
    case "under_assignment":
      return "bg-info";
  }
}

function makeDaysSinceString(date) {
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  const years = Math.floor(diffDays / 365);
  const days = diffDays % 365;

  let elapsedText = "";

  if (years > 0) {
    elapsedText += `πριν ${years} ${years === 1 ? "χρόνο" : "χρόνια"}`;
    if (days > 0) {
      elapsedText += ` και ${days} μέρες`;
    }
  } else {
    elapsedText = `πριν ${days} μέρες`;
    if (days == 0) {
      elapsedText = "σήμερα";
    }
    if (days == 1) {
      elapsedText = "χθες";
    }
  }

  return elapsedText;
}
//Professors API s

//topics
async function getMyTopics() {
  return await request("GET", `${BASE_URL}/v1/my/topics`);
}

async function createTopic(title,summary) {
  return await request("POST", `${BASE_URL}/v1/topics`, {title,summary});
}

async function updateTopic(topicId, title,summary) {
  return await request("PUT", `${BASE_URL}/v1/topics/${topicId}`, {title,summary});
}

async function putDescriptionFile(topicId, formData) {
  return await requestWithFile(
    "PUT",
    `${BASE_URL}/v1/topics/${topicId}/description`,
    formData
  );
}

// async function getTopicDescription(topicId) {
//   const response = await fetch(`${BASE_URL}/v1/topics/${topicId}/description`);
//   if (!response.ok) {
//     throw new Error(`Failed to download file: ${response.statusText}`);
//   }
//   return await response.blob();
// }

//invitations
async function getMyInvitations() {
  return await request("GET", `${BASE_URL}/v1/my/invitations`);
}

async function respondToInvitation(invitationId, response) {
  return await request("PUT",`${BASE_URL}/v1/invitations/${invitationId}/response`,{ response });
}

//async function getThesisDetails(thesisId) {
//  return await request("GET", `${BASE_URL}/v1/theses/${thesisId}`);
//}

//stats
async function getStatistics() {
  return await request("GET", `${BASE_URL}/v1/my/stats`);
}

