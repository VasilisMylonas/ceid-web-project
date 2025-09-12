document.addEventListener('DOMContentLoaded', async () => {
  
    const container = document.querySelector('.container-fluid.py-4');
    const stateAssignment = document.getElementById('state-assignment');
    const stateExamination = document.getElementById('state-examination');
    const stateCompleted = document.getElementById('state-completed');
    const modalElement = document.getElementById('invite-modal');

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

    // --- SETUP EVENT LISTENERS ONCE ---
    if (modalElement) {
        const inviteModal = new bootstrap.Modal(modalElement);
        setupModalEventListeners(modalElement, inviteModal, thesis);
    }

    let activeStateCard = null;

    switch (thesis.status) {
        case 'under_assignment':
            if(stateAssignment) {
                stateAssignment.style.display = 'block';
                populateAssignmentState(thesis);
                activeStateCard = stateAssignment;
            }
            break;
        case 'under_examination':
            if(stateExamination) {
                stateExamination.style.display = 'block';
                populateExaminationState(thesis);
                activeStateCard = stateExamination;
            }
            break;
        case 'completed':
            if(stateCompleted) {
                stateCompleted.style.display = 'block';
                populateCompletedState(thesis);
                activeStateCard = stateCompleted;
            }
            break;
        default:
            populateAssignmentState(thesis);
            break;
    }

    if (activeStateCard) {
        populateCommitteeList(thesis, activeStateCard);
    }
});

function setupModalEventListeners(modalElement, inviteModal, thesis) {
    // --- Logic to populate the modal right before it's shown ---
    modalElement.addEventListener('show.bs.modal', async () => {
        const professorListContainer = document.getElementById('professor-list-container');
        professorListContainer.innerHTML = '<p>Φόρτωση λίστας διδασκόντων...</p>';

        try {
            // Make the API call to get all professors
            const professorsResponse = await getProfessors();
            
            // Console log the response as requested to check for errors
            console.log("Professors fetched for modal:", professorsResponse);

            const invitedProfessorIds = thesis.committeeMembers.map(member => member.professorId);
            professorListContainer.innerHTML = ''; // Clear loading text

            if (!professorsResponse || !professorsResponse.data || professorsResponse.data.length === 0) {
                professorListContainer.innerHTML = '<p class="text-danger">Δεν βρέθηκαν διαθέσιμοι διδάσκοντες.</p>';
                return;
            }

            // Populate the modal with a checkbox for each professor not already on the committee
            professorsResponse.data.forEach(professor => {
                if (invitedProfessorIds.includes(professor.id)) return;

                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${professor.id}" id="prof-${professor.id}">
                    <label class="form-check-label" for="prof-${professor.id}">${professor.name}</label>
                `;
                professorListContainer.appendChild(div);
            });

        } catch (error) {
            console.error("Error fetching professors for modal:", error);
            professorListContainer.innerHTML = '<p class="text-danger">Σφάλμα φόρτωσης διδασκόντων.</p>';
        }
    });

    // --- Logic to handle submitting invitations from the modal ---
    document.getElementById('submit-invitations-btn').onclick = async () => {
        const selectedCheckboxes = document.querySelectorAll('#professor-list-container .form-check-input:checked');
        const selectedProfessorIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));

        if (selectedProfessorIds.length === 0) {
            alert('Παρακαλώ επιλέξτε τουλάχιστον έναν διδάσκοντα.');
            return;
        }

        try {
            // Create an array of promises, one for each invitation request
            const invitationPromises = selectedProfessorIds.map(professorId => {
                console.log(`Sending invitation to professor with ID: ${professorId}`);
                return sendThesisInvitation(thesis.id, professorId);
            });

            // Wait for all invitation requests to complete
            const responses = await Promise.all(invitationPromises);
            
            console.log("All invitations sent successfully:", responses);

            // Show a confirmation dialog to the user
            alert('Όλες οι προσκλήσεις στάλθηκαν με επιτυχία.');

            inviteModal.hide();

            // Refresh the thesis details and the committee list on the main page
            const updatedThesisDetails = await getThesisDetails(thesis.id);
            const activeCard = document.querySelector('#state-assignment[style*="block"]') || 
                               document.querySelector('#state-examination[style*="block"]') || 
                               document.querySelector('#state-completed[style*="block"]');
            
            if (activeCard) {
                populateCommitteeList(updatedThesisDetails.data, activeCard);
            }

        } catch (error) {
            console.error("Error sending one or more invitations:", error);
            alert('Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων. Ενδέχεται κάποιες προσκλήσεις να μην στάλθηκαν.');
        }
    };
}


/**
 * Populates the committee list within a given state card.
 * This function is used to repopulate the committee list in the active state card
 * after an sendThesisInvitationation is sent or when the modal is closed and reopened.
 * @param {object} thesis - The detailed thesis object from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
function populateCommitteeList(thesis, activeStateCard) {
    const committeeList = activeStateCard.querySelector('.list-group');
    if (!committeeList) {
        console.error('Committee list element not found in the active state card.');
        return;
    }
    
    committeeList.innerHTML = ''; // Clear existing list items

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