document.addEventListener('DOMContentLoaded', async () => {
  
    const container = document.querySelector('.container-fluid.py-4');
    const stateAssignment = document.getElementById('state-assignment');
    const stateExamination = document.getElementById('state-examination');
    const stateCompleted = document.getElementById('state-completed');

    const hideAllStates = () => {
        if(stateAssignment) stateAssignment.style.display = 'none';
        if(stateExamination) stateExamination.style.display = 'none';
        if(stateCompleted) stateCompleted.style.display = 'none';
    };

    let thesisSummaryResponse;
    try {
        thesisSummaryResponse = await getThesis();
    } catch (error) {
        console.error("Failed to fetch thesis summary:", error);
        container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης δεδομένων διπλωματικής.</div>';
        return;
    }

    if (!thesisSummaryResponse || !thesisSummaryResponse.data || thesisSummaryResponse.data.length === 0) {
        container.innerHTML = '<div class="alert alert-warning text-center"><h3>Δεν έχετε αναλάβει κάποια διπλωματική εργασία.</h3><p>Η σελίδα αυτή προορίζεται για τη διαχείριση μιας ενεργής διπλωματικής.</p></div>';
        return;
    }
    let thesisDetailsResponse;
    try {
        const thesisId = thesisSummaryResponse.data[0].id;
        thesisDetailsResponse = await getThesisDetails(thesisId);
    } catch (error) {
        console.error("Failed to fetch thesis details:", error);
        container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης λεπτομερειών διπλωματικής.</div>';
        return;
    }
    const thesis = thesisDetailsResponse.data;
    console.log("Thesis details:", thesis);

    hideAllStates();
    switch (thesis.status) {
        case 'under_assignment':
            if(stateAssignment) {
                stateAssignment.style.display = 'block';
                populateAssignmentState(thesis);
            }
            break;
        case 'under_examination':
            if(stateExamination) {
                stateExamination.style.display = 'block';
                populateExaminationState(thesis);
            }
            break;
        case 'completed':
            if(stateCompleted) {
                stateCompleted.style.display = 'block';
                populateCompletedState(thesis);
            }
            break;
        default:
            populateAssignmentState(thesis);
            break;
    }
});

/**
 * Populates the "Under Assignment" card with the list of committee members.
 * This function is called when the page loads and the thesis status is 'under_assignment'.
 * @param {object} thesis - The detailed thesis object from the API.
 */
function populateAssignmentState(thesis) {
    const committeeList = document.querySelector('#state-assignment .list-group');
    if (!committeeList) {
        console.error('Committee list element not found in the DOM.');
        return;
    }
    
    committeeList.innerHTML = ''; // Clear any previous content or placeholders

    if (!thesis.committeeMembers || thesis.committeeMembers.length === 0) {
        committeeList.innerHTML = '<li class="list-group-item">Δεν έχουν οριστεί μέλη επιτροπής.</li>';
        return;
    }

    // Iterate over the committee members from the thesis object and display them
    thesis.committeeMembers.forEach(member => {
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        
        // Since the detailed API provides the role but not the invitation status,
        // we display a generic "Μέλος" badge.
        professor_role = member.role;
        const statusBadge = `<span class="badge bg-success rounded-pill">${Name.ofMemberRole(professor_role)}</span>`;

        li.innerHTML = `
            <div>
                ${member.name}
                <br>
            </div>
            ${statusBadge}
        `;
        committeeList.appendChild(li);
    });
}

function populateExaminationState(thesis) {
    // The API doesn't provide these details yet. This populates with placeholders or empty values.
    // When the 'thesis' object contains these details, they will be filled in.
    document.getElementById('links').value = thesis.notes || '';
    document.getElementById('examDate').value = thesis.presentationDate ? new Date(thesis.presentationDate).toISOString().split('T')[0] : '';
    document.getElementById('examTime').value = thesis.presentationTime || '';
    document.getElementById('examLocation').value = thesis.presentationLocation || '';
    document.getElementById('nimertisLink').value = thesis.nimertisUrl || '';

    const examType = thesis.presentationType || 'online';
    if (document.getElementById(`examType${examType.charAt(0).toUpperCase() + examType.slice(1)}`)) {
        document.getElementById(`examType${examType.charAt(0).toUpperCase() + examType.slice(1)}`).checked = true;
    }
}