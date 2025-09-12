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
    let thesis = thesisDetailsResponse.data;
    console.log("Thesis details:", thesis);

    let invitationsResponse;
    try {
        // Use thesis.id as the argument for getThesisInvitations
        invitationsResponse = await getThesisInvitations(thesis.id);
        console.log("Thesis invitations:", invitationsResponse);
    } catch (error) {
        console.error("Failed to fetch thesis invitations:", error);
        // It's not critical, so we can continue, maybe show a message in the list
        invitationsResponse = { data: [] }; // Ensure it's an array to avoid errors
    }

    hideAllStates();

    // --- SETUP EVENT LISTENERS ONCE ---
    if (modalElement) {
        const inviteModal = new bootstrap.Modal(modalElement);
        // Pass a function that returns the current thesis object.
        // This ensures the modal always has the latest data.
        setupModalEventListeners(modalElement, inviteModal, () => thesis);
    }

    let activeStateCard = null;

    switch (thesis.status) {
        case 'under_assignment':
            console.log("Thesis is under assignment.");
            populatePendingInvitations(invitationsResponse, stateAssignment);
            if(stateAssignment) {
                activeStateCard = stateAssignment;
            }
            break;
        case 'under_examination':
            if(stateExamination) {
                activeStateCard = stateExamination;
            }
            break;
        case 'completed':
            if(stateCompleted) {
                activeStateCard = stateCompleted;
            }
            break;
        default:
            // Fallback to the assignment state if status is unknown
            if(stateAssignment) {
                activeStateCard = stateAssignment;
            }
            break;
    }

    if (activeStateCard) {
        activeStateCard.style.display = 'block';
        // populateCommitteeList handles the member list for all relevant states.
        // We only need to call specific state functions for unique elements, like the exam form.
        if (thesis.status === 'under_examination') {
            populateExaminationState(thesis);
        }
        // These should run for all states that have these lists
        populateCommitteeList(thesis, activeStateCard);
        if (invitationsResponse.data) {
            populatePendingInvitations(invitationsResponse.data, activeStateCard);
        }
    }
});

function setupModalEventListeners(modalElement, inviteModal, getThesis) {
    // --- Logic to populate the modal right before it's shown ---
    modalElement.addEventListener('show.bs.modal', async () => {
        const thesis = getThesis(); // Get the most recent thesis data
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
        const currentThesis = getThesis(); // Get the most recent thesis data
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
                return sendThesisInvitation(currentThesis.id, professorId);
            });

            // Wait for all invitation requests to complete
            const responses = await Promise.all(invitationPromises);
            
            console.log("All invitations sent successfully:", responses);

            // Show a confirmation dialog to the user
            alert('Όλες οι προσκλήσεις στάλθηκαν με επιτυχία.');

            inviteModal.hide();

            // Refresh the thesis details and the committee list on the main page
            const updatedThesisDetails = await getThesisDetails(currentThesis.id);
            // Re-assign the main 'thesis' variable in the outer scope with the new data.
            thesis = updatedThesisDetails.data; 
            const updatedInvitations = await getThesisInvitations(thesis.id);

            const activeCard = document.querySelector('#state-assignment[style*="block"]') || 
                               document.querySelector('#state-examination[style*="block"]') || 
                               document.querySelector('#state-completed[style*="block"]');
            
            if (activeCard) {
                populateCommitteeList(thesis, activeCard);
                populatePendingInvitations(updatedInvitations.data, activeCard);
            }

        } catch (error) {
            console.error("Error sending one or more invitations:", error);
            alert('Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων. Ενδέχεται κάποιες προσκλήσεις να μην στάλθηκαν.');
        }
    };
}


/**
 * Populates the list of pending invitations within a given state card.
 * @param {Array} invitations - The array of invitation objects from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
async function populatePendingInvitations(invitations, activeStateCard) {
   console.log("Populating pending invitations:", invitations);
    const pendingList = activeStateCard.querySelector('.invitation-list');
    if (!pendingList) {
        // This is expected if the card is not 'state-assignment'
        return;
    }
    
    pendingList.innerHTML = ''; // Clear existing list

    const pendingInvitations = invitations.filter(inv => inv.response === 'pending');

    if (pendingInvitations.length === 0) {
        pendingList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν εκκρεμείς προσκλήσεις.</li>';
        return;
    }

    try {
        const professorsResponse = await getProfessors();
        const professorMap = new Map(professorsResponse.data.map(p => [p.id, p.name]));

        pendingInvitations.forEach(invitation => {
            const professorName = professorMap.get(invitation.professorId) || `Άγνωστος Διδάσκων (ID: ${invitation.professorId})`;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            const statusBadge = `<span class="badge bg-warning rounded-pill">Εκκρεμεί</span>`;

            li.innerHTML = `
                <div>
                    ${professorName}
                    <br>
                    <small class="text-muted">Πρόσκληση στάλθηκε: ${new Date(invitation.createdAt).toLocaleDateString('el-GR')}</small>
                </div>
                ${statusBadge}
            `;
            pendingList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching professors for pending invitations:", error);
        pendingList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης λίστας προσκλήσεων.</li>';
    }
}


/**
 * Populates the committee list within a given state card.
 * This function is used to repopulate the committee list in the active state card
 * after an sendThesisInvitationation is sent or when the modal is closed and reopened.
 * @param {object} thesis - The detailed thesis object from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
function populateCommitteeList(thesis, activeStateCard) {
    const committeeList = activeStateCard.querySelector('.committee-member-list');
    if (!committeeList) {
        // This is expected in states that don't have a committee list.
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