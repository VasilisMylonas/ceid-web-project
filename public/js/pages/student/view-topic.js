document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('view-topic-container');
    if (!container) {
        console.error("Main container #view-topic-container not found!");
        return;
    }

    let response;
    try {
        response = await getThesis();
    } catch (error) {
        console.error("Failed to fetch thesis:", error);
        container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης δεδομένων διπλωματικής.</div>';
        return;
    }
    const thesis = response.data[0];
    try {
        topic = await getTopic(thesis.topicId);
    } catch (error) {
        console.error("Failed to fetch topic:", error);
        container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης δεδομένων θέματος.</div>';
        return;
    }
    // Check if the response meta indicates that no thesis was found (count is zero)
    if (!response || !response.meta || response.meta.count === 0) {
        container.innerHTML = '<div class="alert alert-warning text-center"><h3>Δεν έχει ανατεθεί κάποια διπλωματική εργασία.</h3><p>Μπορείτε να δείτε τα διαθέσιμα θέματα και να κάνετε αίτηση.</p></div>';
        return;
    }

    // The thesis is the first object in the 'data' array
    

    // --- Helper function to get status color ---
    function getStatusClass(status) {
        switch (status) {
            case 'available': return 'bg-success';
            case 'assigned':
            case 'under_assignment': return 'bg-primary';
            case 'under_examination': return 'bg-info text-dark';
            case 'completed': return 'bg-secondary';
            default: return 'bg-dark';
        }
    }

    // Fill in thesis details using the correct property names
    document.getElementById("thesis-title").textContent = thesis.topic || "Χωρίς Τίτλο";
    // 'description' is not in the response, so we show a placeholder.
    document.getElementById("thesis-description").textContent = topic.summary || 'Χωρίς Περιγραφή';
    const attachmentLink = document.getElementById("thesis-attachment");
    // 'attachment' is not in the response.
    attachmentLink.textContent = "Χωρίς συνημμένο αρχείο";
    attachmentLink.href = "#";
    attachmentLink.classList.add('disabled');

    // Status badge
    const statusSpan = document.getElementById("thesis-status");
    if (statusSpan) {
        statusSpan.textContent = Name.ofThesisStatus(thesis.status) || thesis.status;
        statusSpan.className = `badge ${getStatusClass(thesis.status)}`;
    }

    // Days since assignment (using 'startDate' from the response)
    const daysElement = document.getElementById("thesis-days");
    if (daysElement && thesis.startDate) {
        const assignedDate = new Date(thesis.startDate);
        const now = new Date();
        const diffTime = Math.abs(now - assignedDate);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        daysElement.textContent = diffDays;
    } else if(daysElement) {
        daysElement.textContent = "-";
    }

    // Committee members (using 'supervisor' from the response)
    const committeeList = document.getElementById("committee-list");
    if (committeeList) {
        committeeList.innerHTML = ""; // Clear existing list
        if (thesis.supervisor) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.textContent = thesis.supervisor;
            
            const roleSpan = document.createElement('span');
            roleSpan.className = 'badge bg-primary rounded-pill';
            roleSpan.textContent = "Επιβλέπων";
            li.appendChild(roleSpan);

            committeeList.appendChild(li);
        } else {
            const li = document.createElement("li");
            li.className = "list-group-item";
            li.textContent = "Δεν έχει οριστεί επιβλέπων.";
            committeeList.appendChild(li);
        }
    }
});