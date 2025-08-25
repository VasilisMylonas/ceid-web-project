export const ThesisStatus = Object.freeze({
  UNDER_ASSIGNMENT: "under_assignment",
  PENDING: "pending",
  ACTIVE: "active",
  REJECTED: "rejected",
  COMPLETED: "completed",
  CANCELLED: "cancelled",
  UNDER_EXAMINATION: "under_examination",
});

export const UserRole = Object.freeze({
  STUDENT: "student",
  PROFESSOR: "professor",
  SECRETARY: "secretary",
  ADMIN: "admin",
});

export const PresentationKind = Object.freeze({
  IN_PERSON: "in_person",
  ONLINE: "online",
});

export const InvitationResponse = Object.freeze({
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
});

export const ResourceKind = Object.freeze({
  DOCUMENT: "document",
  VIDEO: "video",
  IMAGE: "image",
  AUDIO: "audio",
  OTHER: "other",
});

export const ThesisRole = Object.freeze({
  SUPERVISOR: "supervisor",
  STUDENT: "student",
  COMMITTEE_MEMBER: "committee_member",
});
