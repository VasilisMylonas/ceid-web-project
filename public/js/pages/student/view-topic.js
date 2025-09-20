document.addEventListener('DOMContentLoaded', async () => {
    const container = document.getElementById('view-topic-container');
    if (!container) {
        console.error("Main container #view-topic-container not found!");
        return;
    }

    let response = await getThesis();
        if (
            !response ||
            !response.data ||
            response.data.length === 0
        ) {
    container.innerHTML =
      '<div class="alert alert-warning text-center"><h3>Δεν έχετε αναλάβει κάποια διπλωματική εργασία.</h3><p>Η σελίδα αυτή προορίζεται για τη διαχείριση μιας ενεργής διπλωματικής.</p></div>';
    return;
  }

    const thesis = response.data[0];
    try {
        topic = await getTopic(thesis.topicId);
        topic = topic.data;
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
    document.getElementById("thesis-summary").textContent = topic.summary || "Χωρίς Περίληψη";

    const descriptionLink = document.getElementById("thesis-description");

    descriptionLink.textContent = "Λήψη Περιγραφής";
    descriptionLink.href = "#"; // Keep it as a clickable link
    descriptionLink.classList.remove('disabled');

    descriptionLink.addEventListener('click', async (e) => {
        e.preventDefault(); // Prevent the link from navigating
        try {
            const blob = await getTopicDescription(thesis.topicId);

            // Create a temporary link to trigger the download
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // Use the original filename from the topic or a default
            a.download = topic.description || 'description.pdf';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        } catch (error) {
            console.error('Failed to download topic description:', error);
            alert('Δεν υπάρχει διαθέσιμη περιγραφή για αυτό το θέμα.');
        }
    });


    // Status badge
    const statusSpan = document.getElementById("thesis-status");
    if (statusSpan) {
        statusSpan.textContent = Name.ofThesisStatus(thesis.status) || thesis.status;
        statusSpan.className = `badge ${getStatusClass(thesis.status)}`;
    }

    // Days since assignment (using 'startDate' from the response)
    const daysElement = document.getElementById("thesis-days");
    const startDateElement = document.getElementById("thesis-start-date");
    if (daysElement && startDateElement) {
        if (thesis.startDate) {
            const assignedDate = new Date(thesis.startDate);
            const now = new Date();
            const diffTime = Math.abs(now - assignedDate);
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            daysElement.textContent = diffDays;
            startDateElement.textContent = assignedDate.toLocaleDateString('el-GR');
        } else {
            daysElement.textContent = "Η διπλωματική δεν έχει ξεκινήσει";
            startDateElement.textContent = "Η διπλωματική δεν έχει ξεκινήσει";
        }
    }

    // Committee members (using 'supervisor' from the response)
    const committeeList = document.getElementById("committee-list");
    if (committeeList) {
        committeeList.innerHTML = ""; // Clear existing list
        for (const member of thesis.committeeMembers) {
            const li = document.createElement("li");
            li.className = "list-group-item d-flex justify-content-between align-items-center";
            li.textContent = member.name;

            const roleSpan = document.createElement('span');
            roleSpan.className = `badge ${getMemberRoleBootstrapBgClass(member.role)} rounded-pill`;
            roleSpan.textContent = Name.ofMemberRole(member.role);
            li.appendChild(roleSpan);

            committeeList.appendChild(li);
        }
    }
});
