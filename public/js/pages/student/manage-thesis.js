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

    let thesisResponse;
    try {
        thesisResponse = await getThesis();
    } catch (error) {
        console.error("Failed to fetch thesis data:", error);
        container.innerHTML = '<div class="alert alert-danger">Σφάλμα φόρτωσης δεδομένων διπλωματικής.</div>';
        return;
    }

    if (!thesisResponse || !thesisResponse.data || thesisResponse.data.length === 0) {
        container.innerHTML = '<div class="alert alert-warning text-center"><h3>Δεν έχετε αναλάβει κάποια διπλωματική εργασία.</h3><p>Η σελίδα αυτή προορίζεται για τη διαχείριση μιας ενεργής διπλωματικής.</p></div>';
        return;
    }

    const thesis = thesisResponse.data[0];

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
                // populateCompletedState(thesis); // Future implementation
            }
            break;
        default:
            container.innerHTML = `<div class="alert alert-info text-center"><h3>Η κατάσταση της διπλωματικής σας είναι "${Name.ofThesisStatus(thesis.status)}".</h3><p>Δεν απαιτείται κάποια ενέργεια σε αυτή τη φάση.</p></div>`;
            break;
    }
});

async function populateAssignmentState(thesis) {
    const committeeList = document.querySelector('#state-assignment .list-group');
    const modalElement = document.getElementById('invite-modal');
    const inviteModal = new bootstrap.Modal(modalElement);

    if (!committeeList || !modalElement) return;

    // --- Logic to populate the modal right before it's shown ---
    modalElement.addEventListener('show.bs.modal', async () => {
        const professorListContainer = document.getElementById('professor-list-container');
        professorListContainer.innerHTML = '<p>Φόρτωση λίστας διδασκόντων...</p>';

        try {
            const professorsResponse = await getAllProfessors();
            const existingInvitations = await getThesisInvitations(thesis.id);
            const invitedProfessorIds = existingInvitations.map(inv => inv.Professor.id);

            professorListContainer.innerHTML = ''; // Clear loading text

            if (!professorsResponse || !professorsResponse.data || professorsResponse.data.length === 0) {
                professorListContainer.innerHTML = '<p class="text-danger">Δεν βρέθηκαν διαθέσιμοι διδάσκοντες.</p>';
                return;
            }

            professorsResponse.data.forEach(professor => {
                // Don't show professors who have already been invited
                if (invitedProfessorIds.includes(professor.id)) {
                    return;
                }

                const div = document.createElement('div');
                div.className = 'form-check';
                div.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${professor.id}" id="prof-${professor.id}">
                    <label class="form-check-label" for="prof-${professor.id}">
                        ${professor.name}
                    </label>
                `;
                professorListContainer.appendChild(div);
            });

        } catch (error) {
            console.error("Error fetching professors:", error);
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
            await sendThesisInvitations(thesis.id, selectedProfessorIds);
            inviteModal.hide();
            // Refresh the list of invitations on the main page
            await populateAssignmentState(thesis); 
        } catch (error) {
            console.error("Error sending invitations:", error);
            alert('Προέκυψε σφάλμα κατά την αποστολή των προσκλήσεων.');
        }
    };


    // --- Existing logic to populate the main page list ---
    committeeList.innerHTML = '<li class="list-group-item">Φόρτωση προσκλήσεων...</li>'; 

    try {
        const invitations = await getThesisInvitations(thesis.id);
        committeeList.innerHTML = ''; 

        if (!invitations || invitations.length === 0) {
            committeeList.innerHTML = '<li class="list-group-item">Δεν βρέθηκαν προσκλήσεις.</li>';
            return;
        }

        invitations.forEach(invitation => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            let statusBadge;
            switch (invitation.status) {
                case 'pending':
                    statusBadge = '<span class="badge bg-warning text-dark">Αναμονή</span>';
                    break;
                case 'accepted':
                    statusBadge = '<span class="badge bg-success">Αποδεκτή</span>';
                    break;
                case 'rejected':
                    statusBadge = '<span class="badge bg-danger">Απορρίφθηκε</span>';
                    break;
                default:
                    statusBadge = `<span class="badge bg-secondary">${invitation.status}</span>`;
            }

            li.innerHTML = `
                <div>
                    ${invitation.Professor.User.name}
                    <small class="d-block text-muted">${Name.ofMemberRole(invitation.role)}</small>
                </div>
                ${statusBadge}
            `;
            committeeList.appendChild(li);
        });

    } catch (error) {
        console.error("Failed to fetch invitations:", error);
        committeeList.innerHTML = '<li class="list-group-item text-danger">Σφάλμα φόρτωσης προσκλήσεων.</li>';
    }
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