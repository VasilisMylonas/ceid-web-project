// await delay(1000) for 1s delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function saveToFile(content, name, type) {
  var file = new Blob([content], { type: type });

  // Create dummy link and click immediately to trigger download
  var a = document.createElement("a");
  a.href = URL.createObjectURL(file);
  a.download = name;
  a.click();

  // Free memory
  a.remove();
  URL.revokeObjectURL(a.href);
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

  static ofInvitationResponse(response) {
    switch (response) {
      case "pending":
        return "Εκκρεμεί";
      case "accepted":
        return "Αποδεκτή";
      case "rejected":
        return "Απορριφθείσα";
      case "cancelled":
        return "Ακυρωθείσα";
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

function exportThesesToJSON(theses) {
  if (theses.length === 0) {
    alert("Δεν υπάρχουν δεδομένα για εξαγωγή.");
    return;
  }

  const jsonContent = JSON.stringify(theses, null, 2);
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  saveToFile(jsonContent, `theses-${today}.json`, "application/json");
}

function exportThesesCSV(theses) {
  if (theses.length === 0) {
    alert("Δεν υπάρχουν δεδομένα για εξαγωγή.");
    return;
  }

  const keys = Object.keys(theses[0]);

  const rows = theses.map((thesis) =>
    keys.map((header) => {
      let value = thesis[header];

      if (value == null) {
        return "";
      }

      // Escape quotes and commas
      if (typeof value === "string") {
        value = value.replace(/"/g, '""');
        if (value.includes(",") || value.includes('"')) {
          value = `"${value}"`;
        }
      }
      return value;
    })
  );

  const csvContent = [keys, ...rows].map((r) => r.join(",")).join("\r\n");

  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  saveToFile(csvContent, `theses-${today}.csv`, "text/csv");
}
