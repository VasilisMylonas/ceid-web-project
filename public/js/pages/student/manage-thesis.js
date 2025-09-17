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

    // --- Check for preliminary or terminal statuses ---
    const preliminaryStatuses = {
        pending: 'Η αίτησή σας για τη διπλωματική εργασία εκκρεμεί για έγκριση από την γραμματεία.',
        rejected: 'Η αίτησή σας για τη διπλωματική εργασία απορρίφθηκε. Παρακαλώ επικοινωνήστε με την γραμματεία για περισσότερες πληροφορίες.',
        active: 'Η διπλωματική σας εργασία έχει εγκριθεί και είναι σε κατάσταση ενεργή.',
        cancelled: 'Η διπλωματική εργασία έχει ακυρωθεί.'
    };

    if (Object.keys(preliminaryStatuses).includes(thesis.status)) {
        container.innerHTML = `
            <div class="alert alert-info text-center">
                <h3>Ενημέρωση Κατάστασης</h3>
                <p class="lead">${preliminaryStatuses[thesis.status]}</p>
            </div>
        `;
        return; // Stop further execution
    }


    

    hideAllStates();
    
    // --- SETUP EVENT LISTENERS ONCE ---

    let invitationsResponse = []; // Initialize as an empty array
    if (modalElement) {
        const inviteModal = new bootstrap.Modal(modalElement);
        // Pass functions to get the current thesis and invitations data.
        setupModalEventListeners(modalElement, inviteModal, () => thesis, () => invitationsResponse);
    }

    // Event listener for saving examination details and links
    const saveExamBtn = document.getElementById('save-examination-btn');
    if (saveExamBtn) {
        saveExamBtn.addEventListener('click', async () => {
            if (!thesis) return;

            // --- Handle Presentation Data ---
            try {
                const date = document.getElementById('examDate').value;
                const time = document.getElementById('examTime').value;
                const kind = document.querySelector('input[name="examType"]:checked').value;
                const location = document.getElementById('examLocation').value;
                const link = document.getElementById('examLink').value; 
                
                console.log("Presentation details to save:", { date, time, kind, location, link });

                if (kind === 'in_person' && !location) {
                    alert('Παρακαλώ εισάγετε την τοποθεσία της εξέτασης.');
                    return;
                }
                if (kind === 'online' && !link) {
                    alert('Παρακαλώ εισάγετε τον σύνδεσμο της τηλεδιάσκεψης.');
                    return;
                }
                if (date && time && kind && location) {
                    // Format date and time as "YYYY-MM-DDTHH:mm:00"
                    const formattedDateTime = `${date}T${time}:00`;
                    const presentationData = {
                        date: formattedDateTime,
                        kind: kind === 'online' ? 'online' : 'in_person',
                    };
                    if (kind === 'online') {
                        presentationData.link = link;
                        if (location) {
                            presentationData.hall = location; // Optional, if provided
                        }
                    }
                    if (kind === 'in_person') {
                       
                        presentationData.hall = location;
                        if (link) {
                            presentationData.link = link; // Optional, if provided
                        }

                    }
                    await createThesisPresentation(thesis.id, presentationData);
                    console.log("Saved presentation data:", presentationData);
                    alert('Οι λεπτομέρειες της εξέτασης αποθηκεύτηκαν.');
                }
            } catch (error) {
                console.error('Failed to save presentation details:', error);
                alert(error);
            }

            // --- Handle Links Data ---
            const linksText = document.getElementById('links-to-add').value;
            const linksArray = linksText.split('\n').map(link => link.trim()).filter(link => link);
            
            if (linksArray.length > 0) {
                const resources = linksArray.map(link => ({ link: link, kind: 'other' }));
                try {
                    const promises = resources.map(res => addThesisResources(thesis.id, res));
                    await Promise.all(promises);
                    alert('Οι σύνδεσμοι αποθηκεύτηκαν.');
                    document.getElementById('links-to-add').value = '';
                } catch (error) {
                    console.error('Failed to save links:', error);
                    alert('Σφάλμα κατά την αποθήκευση των συνδέσμων.');
                }
            }

             // --- Handle Nimertis Link ---
            const nimertisUrl = document.getElementById('nimertisLink').value.trim();
            if (nimertisUrl) {
                try {
                    await setNymertesLink(thesis.id, nimertisUrl);
                    
                    alert('Ο σύνδεσμος Νημερτής αποθηκεύτηκε.');
                } catch (error) {
                    console.error('Failed to save Nimertis link:', error);
                    alert('Προέκυψε σφάλμα κατά την αποθήκευση του συνδέσμου Νημερτής.');
                }
            }

        });
    }

    // Add event listener for uploading the thesis draft
    const uploadDraftBtn = document.getElementById('upload-draft-btn');
    if (uploadDraftBtn) {
        uploadDraftBtn.addEventListener('click', async () => {
            if (!thesis) return;

            const fileInput = document.getElementById('thesisFile');
            const file = fileInput.files[0];

            if (!file) {
                alert('Παρακαλώ επιλέξτε ένα αρχείο PDF για ανέβασμα.');
                return;
            }

            const formData = new FormData();
            formData.append('file', file);

            try {
                await uploadThesisDraft(thesis.id, formData);
                alert('Το αρχείο της διπλωματικής ανέβηκε με επιτυχία.');
                fileInput.value = ''; // Clear the file input
            } catch (error) {
                console.error('Failed to upload thesis draft:', error);
                alert('Προέκυψε σφάλμα κατά το ανέβασμα του αρχείου.');
            }
        });
    }

    // --- Display Current Draft Button ---
    const downloadDraftBtn = document.getElementById('download-draft-btn');
    
    downloadDraftBtn.innerHTML = `
        <i class="fas fa-file-download me-2"></i>Λήψη Τρέχοντος Αρχείου 
    `;
    downloadDraftBtn.style.display = 'block';

   
    if (downloadDraftBtn) {
        downloadDraftBtn.addEventListener('click', async () => {
            if (thesis) {
                try {
                    const blob = await getThesisDraft(thesis.id);
                    
                    // Create a temporary link to trigger the download
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.style.display = 'none';
                    a.href = url;
                    a.download = 'current_draft.pdf'; 
                    document.body.appendChild(a);
                    a.click();
                    window.URL.revokeObjectURL(url);
                    a.remove();

                } catch (error) {
                    console.error('Failed to download thesis draft:', error);
                    alert('Προέκυψε σφάλμα κατά τη λήψη του αρχείου.');
                }
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
        if (resourcesResponse?.data?.length > 0) {
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

    // --- Populate Presentation Details from the latest presentation entry ---
    try {
        const presentationsResponse = await getThesisPresentations(thesis.id);
        if (presentationsResponse?.data?.length > 0) {
            const lastPresentation = presentationsResponse.data[presentationsResponse.data.length - 1]; //get the last presentation
            
            const presentationDate = new Date(lastPresentation.date);
            
            // Format date as YYYY-MM-DD
            document.getElementById('examDate').value = presentationDate.toISOString().split('T')[0];
            
            // Format time as HH:MM
            const hours = String(presentationDate.getUTCHours()).padStart(2, '0');
            const minutes = String(presentationDate.getUTCMinutes()).padStart(2, '0');
            document.getElementById('examTime').value = `${hours}:${minutes}`;

            document.getElementById('examLocation').value = lastPresentation.hall || '';
            document.getElementById('examLink').value = lastPresentation.link || '';

            const examType = lastPresentation.kind || 'in_person';
            const radio = document.getElementById(examType);
            if (radio) {
                radio.checked = true;
            }
        } else {
            // Fallback if no presentations are found
            document.getElementById('examDate').value = '';
            document.getElementById('examTime').value = '';
            document.getElementById('examLocation').value = '';
            document.getElementById('examLink').value = '';
        }
    } catch (error) {
        console.error("Failed to load thesis presentations:", error);
        // Clear fields on error to avoid showing stale data
        document.getElementById('examDate').value = '';
        document.getElementById('examTime').value = '';
        document.getElementById('examLocation').value = '';
        document.getElementById('examLink').value = '';
    }

    // Populate Nimertis link from the main thesis object, dont have get for nimertis link
   // document.getElementById('nimertisLink').value =
}
