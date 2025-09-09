document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration ---
    const CURRENT_USER_NAME = 'Δρ. Α. Γεωργίου';

    // --- Sample Data (simulates data from a backend API) ---
    const sampleTheses = [
        {
            id: 1, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', student: 'Μαρία Σταύρου', myRole: 'supervisor', status: 'Active',
            assignmentDate: '2024-03-18',
            committee: [{ name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' }, { name: 'Δρ. Π. Βασιλείου', role: 'Μέλος' }],
            timeline: [{ date: '18/03/2024', event: 'Οριστικοποίηση Ανάθεσης' }],
            notes: [{ text: 'Πρόοδος στο κεφάλαιο 3.' }]
        },
        {
            id: 2, title: 'Ανάπτυξη Εφαρμογών για Κινητά', student: 'Νίκος Δημητρίου', myRole: 'member', status: 'Completed',
            assignmentDate: '2023-02-10',
            committee: [{ name: 'Δρ. Κ. Νικολάου', role: 'Επιβλέπων' }, { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }],
            timeline: [{ date: '10/01/2024', event: 'Ολοκλήρωση' }],
            finalGrade: 8.5, repoLink: '#', gradingFormLink: '#'
        },
        {
            id: 3, title: 'Ανάλυση Μεγάλων Δεδομένων', student: 'Ελένη Ιωάννου', myRole: 'supervisor', status: 'Under Assignment',
            assignmentDate: '2025-09-01',
            committee: [
                { name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' },
                { name: 'Δρ. Π. Βασιλείου', role: 'Μέλος', status: 'accepted', date: '16/03/2025' },
                { name: 'Δρ. Ε. Καραγιάννης', role: 'Μέλος', status: 'pending', date: '15/03/2025' }
            ],
            timeline: [{ date: '15/03/2025', event: 'Πρόσκληση επιτροπής' }]
        },
        {
            id: 4, title: 'Ασφάλεια σε Δίκτυα 5G', student: 'Γιώργος Λάμπρου', myRole: 'member', status: 'Under Review',
            assignmentDate: '2024-01-20', presentationDetailsFilled: true, gradingActive: true,
            grades: { 'Δρ. Σ. Παππά': 8, 'Δρ. Α. Γεωργίου': null },
            committee: [{ name: 'Δρ. Σ. Παππά', role: 'Επιβλέπων' }, { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }],
            timeline: [{ date: '20/09/2024', event: 'Αλλαγή σε "Υπό Εξέταση"' }], draftLink: '#'
        },
        {
            id: 5, title: 'Βάσεις Δεδομένων Γράφων', student: 'Άννα Κωστοπούλου', myRole: 'supervisor', status: 'Active',
            assignmentDate: '2022-05-10', // Older than 2 years
            committee: [{ name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' }],
            timeline: [{ date: '10/05/2022', event: 'Οριστικοποίηση Ανάθεσης' }], notes: []
        },
        {
            id: 6, title: 'Blockchain και Αποκεντρωμένες Εφαρμογές', student: 'Κώστας Παπαγεωργίου', myRole: 'member', status: 'Active',
            assignmentDate: '2024-04-01',
            committee: [{ name: 'Δρ. Μ. Δημοπούλου', role: 'Επιβλέπων' }, { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }],
            timeline: [{ date: '01/04/2024', event: 'Οριστικοποίηση Ανάθεσης' }],
            notes: [{ text: 'Η αρχική έρευνα φαίνεται ελπιδοφόρα.' }]
        },
        {
            id: 7, title: 'Ανάλυση Συναισθήματος σε Κείμενα', student: 'Ειρήνη Νικολάου', myRole: 'supervisor', status: 'Under Review',
            assignmentDate: '2024-02-15', presentationDetailsFilled: false, gradingActive: false,
            grades: { 'Δρ. Α. Γεωργίου': null, 'Δρ. Χ. Παπαδάκης': null },
            committee: [{ name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' }, { name: 'Δρ. Χ. Παπαδάκης', role: 'Μέλος' }],
            timeline: [{ date: '05/09/2025', event: 'Αλλαγή σε "Υπό Εξέταση"' }], draftLink: '#'
        }
    ];

    // --- DOM Elements ---
    const tableBody = document.getElementById('theses-table-body');
    const filterForm = document.getElementById('filter-form');
    const detailsModalEl = document.getElementById('thesis-details-modal');
    const detailsModal = new bootstrap.Modal(detailsModalEl);

    /**
     * Renders the theses table based on the current filter values.
     */
    const renderTable = () => {
        const statusFilter = document.getElementById('filter-status').value;
        const roleFilter = document.getElementById('filter-role').value;

        const filteredTheses = sampleTheses.filter(thesis => 
            (statusFilter === 'all' || thesis.status === statusFilter) && 
            (roleFilter === 'all' || thesis.myRole === roleFilter)
        );

        tableBody.innerHTML = '';
        filteredTheses.forEach(thesis => {
            const row = document.createElement('tr');
            row.dataset.thesisId = thesis.id;
            
            const statusBadges = {
                'Active': 'bg-primary',
                'Completed': 'bg-success',
                'Under Assignment': 'bg-warning text-dark',
                'Under Review': 'bg-info text-dark',
                'Canceled': 'bg-danger',
            };
            const badgeClass = statusBadges[thesis.status] || 'bg-secondary';

            row.innerHTML = `
                <td>${thesis.title}</td>
                <td>${thesis.student}</td>
                <td>${thesis.myRole === 'supervisor' ? 'Επιβλέπων' : 'Μέλος Επιτροπής'}</td>
                <td><span class="badge ${badgeClass}">${thesis.status}</span></td>
                <td class="text-center"><button class="btn btn-sm btn-primary manage-btn">Διαχείριση</button></td>
            `;
            tableBody.appendChild(row);
        });
    };

    /**
     * Populates and displays the management modal for a given thesis.
     * @param {string} thesisId - The ID of the thesis to display.
     */
    const populateAndShowModal = (thesisId) => {
        const thesis = sampleTheses.find(t => t.id == thesisId);
        if (!thesis) return;

        // Store thesis ID on the modal for easy access
        detailsModalEl.querySelector('.modal-body').dataset.thesisId = thesis.id;

        // Reset modal state by hiding all action sections
        document.querySelectorAll('.action-section, .supervisor-action, #grading-section').forEach(el => el.style.display = 'none');
        
        // Populate common information
        document.getElementById('thesis-modal-title').textContent = thesis.title;
        document.getElementById('modal-student-name').textContent = thesis.student;
        document.getElementById('modal-committee-list').innerHTML = thesis.committee.map(m => `<li>${m.name} (${m.role})</li>`).join('');
        document.getElementById('modal-timeline').innerHTML = (thesis.timeline || []).map(t => `<li class="list-group-item">${t.event} - ${t.date}</li>`).join('');

        // Show the correct action section based on the thesis status
        const isSupervisor = thesis.myRole === 'supervisor';
        switch (thesis.status) {
            case 'Under Assignment':
                _showUnderAssignmentActions(thesis, isSupervisor);
                break;
            case 'Active':
                _showActiveActions(thesis, isSupervisor);
                break;
            case 'Under Review':
                _showUnderReviewActions(thesis, isSupervisor);
                break;
            case 'Completed':
                _showCompletedActions(thesis);
                break;
        }

        detailsModal.show();
    };

    // --- Modal Helper Functions ---

    function _showUnderAssignmentActions(thesis, isSupervisor) {
        const section = document.getElementById('actions-under-assignment');
        section.style.display = 'block';
        const committeeStatusDiv = document.getElementById('modal-committee-status');
        committeeStatusDiv.innerHTML = thesis.committee.filter(m => m.role !== 'Επιβλέπων').map(m => {
            const statusText = m.status === 'accepted' ? `Αποδέχτηκε (${m.date})` : `Εκκρεμεί (Πρόσκληση: ${m.date})`;
            return `<p>${m.name}: <span class="${m.status === 'accepted' ? 'text-success' : 'text-warning'}">${statusText}</span></p>`;
        }).join('');
        if (isSupervisor) {
            document.getElementById('supervisor-actions-under-assignment').style.display = 'block';
        }
    }

    function _showActiveActions(thesis, isSupervisor) {
        const section = document.getElementById('actions-active');
        section.style.display = 'block';
        document.getElementById('modal-notes-list').innerHTML = (thesis.notes || []).map(n => `<p class="fst-italic border-start ps-2">"${n.text}"</p>`).join('');
        if (isSupervisor) {
            document.getElementById('supervisor-actions-active').style.display = 'block';
            const twoYearsAgo = new Date();
            twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
            document.getElementById('cancel-thesis-section').style.display = new Date(thesis.assignmentDate) < twoYearsAgo ? 'block' : 'none';
        }
    }

    function _showUnderReviewActions(thesis, isSupervisor) {
        const section = document.getElementById('actions-under-review');
        section.style.display = 'block';
        document.getElementById('view-draft-link').href = thesis.draftLink || '#';
        if (isSupervisor) {
            document.getElementById('supervisor-actions-under-review').style.display = 'block';
            document.getElementById('generate-announcement-btn').disabled = !thesis.presentationDetailsFilled;
            document.getElementById('activate-grading-btn').style.display = thesis.gradingActive ? 'none' : 'inline-block';
        }
        if (thesis.gradingActive) {
            document.getElementById('grading-section').style.display = 'block';
            const gradingBody = document.getElementById('grading-table-body');
            gradingBody.innerHTML = Object.entries(thesis.grades).map(([prof, grade]) => {
                const actionBtn = (prof === CURRENT_USER_NAME && grade === null) ? '<button class="btn btn-sm btn-success grade-btn">Βαθμολόγησε</button>' : '';
                return `<tr><td>${prof}</td><td>${grade ?? 'Εκκρεμεί'}</td><td>${actionBtn}</td></tr>`;
            }).join('');
        }
    }

    function _showCompletedActions(thesis) {
        const section = document.getElementById('actions-completed');
        section.style.display = 'block';
        document.getElementById('modal-final-grade').textContent = thesis.finalGrade || 'N/A';
        document.getElementById('modal-repo-link').href = thesis.repoLink || '#';
        document.getElementById('modal-grading-form-link').href = thesis.gradingFormLink || '#';
    }

    // --- Event Listeners ---

    // Listen for filter form submission
    filterForm.addEventListener('submit', e => {
        e.preventDefault();
        renderTable();
    });

    // Use event delegation on the table body to handle clicks on "Manage" buttons
    tableBody.addEventListener('click', e => {
        if (e.target.classList.contains('manage-btn')) {
            const thesisId = e.target.closest('tr').dataset.thesisId;
            populateAndShowModal(thesisId);
        }
    });

    // Use event delegation on the modal to handle various actions
    detailsModalEl.addEventListener('click', e => {
        const thesisId = detailsModalEl.querySelector('.modal-body').dataset.thesisId;
        const thesis = sampleTheses.find(t => t.id == thesisId);
        if (!thesis) return;

        if (e.target.id === 'add-note-btn') {
            const noteInput = document.getElementById('modal-new-note');
            if (noteInput.value) {
                thesis.notes.push({ text: noteInput.value });
                noteInput.value = '';
                populateAndShowModal(thesisId); // Re-render modal content
            }
        } else if (e.target.id === 'change-status-to-review-btn') {
            thesis.status = 'Under Review';
            detailsModal.hide();
            renderTable();
        } else if (e.target.id === 'activate-grading-btn') {
            thesis.gradingActive = true;
            populateAndShowModal(thesisId); // Re-render modal content
        }
    });

    // --- Initial Load ---
    renderTable();
});