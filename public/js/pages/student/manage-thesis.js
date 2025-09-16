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

    let invitationsResponse = []; // Initialize as an empty array

    hideAllStates();

    // --- SETUP EVENT LISTENERS ONCE ---
    if (modalElement) {
        const inviteModal = new bootstrap.Modal(modalElement);
        // Pass functions to get the current thesis and invitations data.
        setupModalEventListeners(modalElement, inviteModal, () => thesis, () => invitationsResponse);
    }

    // Add event listener for saving examination links
    const saveExamBtn = document.getElementById('save-examination-btn');
    if (saveExamBtn) {
        saveExamBtn.addEventListener('click', async () => {
            if (!thesis) return;

            const linksText = document.getElementById('links-to-add').value;
            // Split by newline, trim whitespace, and filter out empty lines
            const linksArray = linksText.split('\n').map(link => link.trim()).filter(link => link);

            if (linksArray.length === 0) {
                alert('Παρακαλώ εισάγετε τουλάχιστον έναν σύνδεσμο για αποθήκευση.');
                return;
            }

            // Format for the API: [{link: "...", kind: "other"}]
            const resources = linksArray.map(link => ({ link: link, kind: 'other' }));

            try {
                // The API likely expects one resource per call.
                // We create an array of promises, one for each resource to be added.
                const resourcePromises = resources.map(resource => addThesisResources(thesis.id, resource));
                
                // Wait for all the individual requests to complete.
                await Promise.all(resourcePromises);

                alert('Οι σύνδεσμοι αποθηκεύτηκαν με επιτυχία.');
                document.getElementById('links-to-add').value = ''; // Clear the textarea
                await populateExaminationState(thesis); // Refresh the list of links

            } catch (error) {
                console.error('Failed to save links:', error);
                alert('Προέκυψε σφάλμα κατά την αποθήκευση των συνδέσμων.');
            }
        });
    }

    let activeStateCard = null;

    switch (thesis.status) {
        case 'under_assignment':
            console.log("Thesis is under assignment.");
            // The call to populateInvitationsList is removed from here.
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
        
        // Populate lists common to most states
        populateCommitteeList(thesis, activeStateCard);

        // --- Conditional Logic for States ---
        if (thesis.status === 'under_assignment') {
            try {
                // Fetch and populate invitations ONLY for this state
                invitationsResponse = await getThesisInvitations(thesis.id);
                populateInvitationsList(invitationsResponse, activeStateCard);
            } catch (error) {
                console.error("Failed to fetch or populate invitations:", error);
                const invitationList = activeStateCard.querySelector('.invitation-list');
                if(invitationList) invitationList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης προσκλήσεων.</li>';
            }
        } else if (thesis.status === 'under_examination') {
            await populateExaminationState(thesis);
        }
    }
});

function setupModalEventListeners(modalElement, inviteModal, getThesis, getInvitations) {
    // --- Logic to populate the modal right before it's shown ---
    modalElement.addEventListener('show.bs.modal', async () => {
        const thesis = getThesis(); // Get the most recent thesis data
        const invitations = getInvitations(); // Get the most recent invitations data
        const professorListContainer = document.getElementById('professor-list-container');
        professorListContainer.innerHTML = '<p>Φόρτωση λίστας διδασκόντων...</p>';

        try {
            const professorsResponse = await getProfessors();
            console.log("Professors fetched for modal:", professorsResponse);

            // Set of professors already on the committee
            const committeeMemberIds = new Set(thesis.committeeMembers.map(member => member.professorId));
            
            // Set of professors with pending, rejected, or accepted invitations
            const alreadyInvitedIds = new Set(
                invitations
                    .filter(inv => inv.response === 'pending' || inv.response === 'declined')
                    .map(inv => inv.professorId)
            );

            professorListContainer.innerHTML = ''; // Clear loading text

            if (!professorsResponse || !professorsResponse.data || professorsResponse.data.length === 0) {
                professorListContainer.innerHTML = '<p class="text-danger">Δεν βρέθηκαν διαθέσιμοι διδάσκοντες.</p>';
                return;
            }

            professorsResponse.data.forEach(professor => {
                // Don't show professors who are already confirmed members
                if (committeeMemberIds.has(professor.id)) {
                    return;
                }

                const isAlreadyInvited = alreadyInvitedIds.has(professor.id);
                const div = document.createElement('div');
                div.className = 'form-check';
                
                div.innerHTML = `
                    <input 
                        class="form-check-input" 
                        type="checkbox" 
                        value="${professor.id}" 
                        id="prof-${professor.id}" 
                        ${isAlreadyInvited ? 'disabled' : ''}
                    >
                    <label 
                        class="form-check-label ${isAlreadyInvited ? 'text-muted' : ''}" 
                        for="prof-${professor.id}"
                    >
                        ${professor.name} ${isAlreadyInvited ? '(Έχει ήδη προσκληθεί)' : ''}
                    </label>
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
            // Also update the main invitations variable in the outer scope.
            invitationsResponse = updatedInvitations;

            const activeCard = document.querySelector('#state-assignment[style*="block"]') || 
                               document.querySelector('#state-examination[style*="block"]') || 
                               document.querySelector('#state-completed[style*="block"]');
            
            if (activeCard) {
                populateCommitteeList(thesis, activeCard);
                populateInvitationsList(updatedInvitations, activeCard);
            }

        } catch (error) {
            console.error("Error sending one or more invitations:", error);
            alert('Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων. Ενδέχεται κάποιες προσκλήσεις να μην στάλθηκαν.');
        }
    };
}


/**
 * Populates the list of pending and rejected invitations within a given state card.
 * @param {Array} invitations - The array of invitation objects from the API.
 * @param {HTMLElement} activeStateCard - The currently active state card element.
 */
async function populateInvitationsList(invitations, activeStateCard) {
   console.log("Populating invitations:", invitations);
    const invitationList = activeStateCard.querySelector('.invitation-list');
    if (!invitationList) {
        // This is expected if the card is not 'state-assignment'
        return;
    }
    
    invitationList.innerHTML = ''; // Clear existing list

    const relevantInvitations = invitations.filter(inv => inv.response === 'pending' || inv.response === 'rejected');

    if (relevantInvitations.length === 0) {
        invitationList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν εκκρεμείς ή απορριφθείσες προσκλήσεις.</li>';
        return;
    }

    try {
        const professorsResponse = await getProfessors();
        const professorMap = new Map(professorsResponse.data.map(p => [p.id, p.name]));

        relevantInvitations.forEach(invitation => {
            const professorName = professorMap.get(invitation.professorId) || `Άγνωστος Διδάσκων (ID: ${invitation.professorId})`;
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            
            let statusBadge;
            if (invitation.response === 'pending') {
                statusBadge = `<span class="badge bg-warning rounded-pill">Εκκρεμεί</span>`;
            } else if (invitation.response === 'rejected') {
                statusBadge = `<span class="badge bg-danger rounded-pill">Απορρίφθηκε</span>`;
            }

            li.innerHTML = `
                <div>
                    ${professorName}
                    <br>
                    <small class="text-muted">Πρόσκληση στάλθηκε: ${new Date(invitation.createdAt).toLocaleDateString('el-GR')}</small>
                </div>
                ${statusBadge}
            `;
            invitationList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching professors for invitations list:", error);
        invitationList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης λίστας προσκλήσεων.</li>';
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



async function populateExaminationState(thesis) {
    const linksList = document.getElementById('existing-links-list');
    linksList.innerHTML = ''; // Clear current list

    try {
        const resourcesResponse = await getThesisResources(thesis.id);
        if (resourcesResponse && resourcesResponse.data && resourcesResponse.data.length > 0) {
            resourcesResponse.data.forEach(resource => {
                const li = document.createElement('li');
                li.className = 'list-group-item';
                li.innerHTML = `<a href="${resource.link}" target="_blank" rel="noopener noreferrer">${resource.link}</a>`;
                linksList.appendChild(li);
            });
        } else {
            linksList.innerHTML = '<li class="list-group-item">Δεν υπάρχουν αποθηκευμένοι σύνδεσμοι.</li>';
        }
    } catch (error) {
        console.error("Failed to load thesis resources:", error);
        linksList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης συνδέσμων.</li>';
    }

    // Populate other fields
    document.getElementById('examDate').value = thesis.presentationDate ? new Date(thesis.presentationDate).toISOString().split('T')[0] : '';
    document.getElementById('examTime').value = thesis.presentationTime || '';
    document.getElementById('examLocation').value = thesis.presentationLocation || '';
    document.getElementById('nimertisLink').value = thesis.nimertisUrl || '';

    const examType = thesis.presentationType || 'online';
    const radioId = `examType${examType.charAt(0).toUpperCase() + examType.slice(1)}`;
    const radio = document.getElementById(radioId);
    if (radio) {
        radio.checked = true;
    }
}