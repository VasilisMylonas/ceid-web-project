document.addEventListener('DOMContentLoaded', async () => {
    // Fetch the student's thesis
    let thesisData;
    try {
        thesisData = await getThesis();
    } catch (error) {
        console.error("Failed to fetch thesis:", error);
        document.getElementById("thesis-title").textContent = "Σφάλμα φόρτωσης δεδομένων";
        return;
    }

    if (!thesisData || !thesisData.data) {
        document.getElementById("thesis-title").textContent = "Δεν βρέθηκε διπλωματική εργασία";
        return;
    }

    const thesis = thesisData.data;

    // Fill in thesis details
    document.getElementById("thesis-title").textContent = thesis.title || "-";
    document.getElementById("thesis-description").textContent = thesis.description || "-";
    document.getElementById("thesis-attachment").textContent = thesis.attachmentName || "Χωρίς αρχείο";
    document.getElementById("thesis-attachment").href = thesis.attachmentUrl || "#";

    // Status badge
    const statusSpan = document.getElementById("thesis-status");
    statusSpan.textContent = Name.ofThesisStatus(thesis.status) || "-";
    statusSpan.className = "badge bg-secondary";

    // Days since assignment
    if (thesis.assignedAt) {
        const assignedDate = new Date(thesis.assignedAt);
        const now = new Date();
        const diffTime = Math.abs(now - assignedDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        document.getElementById("thesis-days").textContent = diffDays;
    } else {
        document.getElementById("thesis-days").textContent = "-";
    }

    // Committee members
    const committeeList = document.getElementById("committee-list");
    committeeList.innerHTML = "";
    if (Array.isArray(thesis.committee)) {
        thesis.committee.forEach(member => {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = `${member.name} (${Name.ofMemberRole(member.role) || member.role})`;
            committeeList.appendChild(li);
        });
    } else {
        const li = document.createElement("li");
        li.className = "list-group-item";
        li.textContent = "Δεν έχουν οριστεί μέλη επιτροπής.";
        committeeList.appendChild(li);