document.addEventListener('DOMContentLoaded', () => {
    // --- Sample Data (to be replaced by API calls) ---
    const sampleTheses = [
        {
            id: 1,
            title: 'Τεχνητή Νοημοσύνη στην Ιατρική',
            student: 'Μαρία Σταύρου',
            myRole: 'supervisor',
            status: 'Active',
            committee: [
                { name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' },
                { name: 'Δρ. Π. Βασιλείου', role: 'Μέλος' },
                { name: 'Δρ. Ε. Καραγιάννης', role: 'Μέλος' }
            ],
            timeline: [
                { date: '18/03/2024', event: 'Οριστικοποίηση Ανάθεσης' },
                { date: '15/03/2024', event: 'Προσωρινή Ανάθεση' }
            ],
            notes: [{ text: 'Πρόοδος στο κεφάλαιο 3.' }]
        },
        {
            id: 2,
            title: 'Ανάπτυξη Εφαρμογών για Κινητά',
            student: 'Νίκος Δημητρίου',
            myRole: 'member',
            status: 'Completed',
            committee: [
                { name: 'Δρ. Κ. Νικολάου', role: 'Επιβλέπων' },
                { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }
            ],
            timeline: [{ date: '10/01/2024', event: 'Ολοκλήρωση' }],
            finalGrade: 8.5,
            repoLink: '#',
            gradingFormLink: '#'
        },
        {
            id: 3,
            title: 'Ανάλυση Μεγάλων Δεδομένων',
            student: 'Ελένη Ιωάννου',
            myRole: 'supervisor',
            status: 'Under Assignment',
            committee: [
                { name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων', status: 'pending' },
                { name: 'Δρ. Π. Βασιλείου', role: 'Μέλος', status: 'accepted', date: '16/03/2024' },
                { name: 'Δρ. Ε. Καραγιάννης', role: 'Μέλος', status: 'pending', date: '15/03/2024' }
            ],
            timeline: [{ date: '15/03/2024', event: 'Πρόσκληση επιτροπής' }]
        },
        {
            id: 4,
            title: 'Ασφάλεια σε Δίκτυα 5G',
            student: 'Γιώργος Λάμπρου',
            myRole: 'member',
            status: 'Under Review',
            committee: [
                { name: 'Δρ. Σ. Παππά', role: 'Επιβλέπων' },
                { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }
            ],
            timeline: [{ date: '20/09/2024', event: 'Αλλαγή σε "Υπό Εξέταση"' }],
            draftLink: '#'
        }
    ];

    // --- DOM Elements ---
    const tableBody = document.getElementById('theses-table-body');
    const filterForm = document.getElementById('filter-form');
    const detailsModal = new bootstrap.Modal(document.getElementById('thesis-details-modal'));

    // --- Functions ---
    const renderTable = () => {
        const statusFilter = document.getElementById('filter-status').value;
        const roleFilter = document.getElementById('filter-role').value;

        const filteredTheses = sampleTheses.filter(thesis => {
            const statusMatch = statusFilter === 'all' || thesis.status === statusFilter;
            const roleMatch = roleFilter === 'all' || thesis.myRole === roleFilter;
            return statusMatch && roleMatch;
        });

        tableBody.innerHTML = '';
        filteredTheses.forEach(thesis => {
            const row = document.createElement('tr');
            row.setAttribute('data-thesis-id', thesis.id);

            let statusBadge;
            switch (thesis.status) {
                case 'Active': statusBadge = 'bg-primary'; break;
                case 'Completed': statusBadge = 'bg-success'; break;
                case 'Under Assignment': statusBadge = 'bg-warning text-dark'; break;
                case 'Under Review': statusBadge = 'bg-info text-dark'; break;
                case 'Canceled': statusBadge = 'bg-danger'; break;
                default: statusBadge = 'bg-secondary';
            }

            row.innerHTML = `
                <td>${thesis.title}</td>
                <td>${thesis.student}</td>
                <td>${thesis.myRole === 'supervisor' ? 'Επιβλέπων' : 'Μέλος Επιτροπής'}</td>
                <td><span class="badge ${statusBadge}">${thesis.status.replace(/_/g, ' ')}</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary manage-btn">Διαχείριση</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    };

    const populateAndShowModal = (thesisId) => {
        const thesis = sampleTheses.find(t => t.id == thesisId);
        if (!thesis) return;

        // --- Reset and Hide All Sections ---
        document.querySelectorAll('.action-section, .supervisor-action').forEach(el => el.style.display = 'none');
        
        // --- Populate Common Info ---
        document.getElementById('thesis-modal-title').textContent = thesis.title;
        document.getElementById('modal-student-name').textContent = thesis.student;
        
        const committeeList = document.getElementById('modal-committee-list');
        committeeList.innerHTML = '';
        thesis.committee.forEach(m => {
            committeeList.innerHTML += `<li>${m.name} (${m.role})</li>`;
        });

        const timeline = document.getElementById('modal-timeline');
        timeline.innerHTML = '';
        (thesis.timeline || []).forEach(t => {
            timeline.innerHTML += `<li class="list-group-item">${t.event} - ${t.date}</li>`;
        });

        // --- Show Sections Based on Status and Role ---
        const isSupervisor = thesis.myRole === 'supervisor';

        if (thesis.status === 'Under Assignment') {
            const section = document.getElementById('actions-under-assignment');
            section.style.display = 'block';
            const committeeStatusDiv = document.getElementById('modal-committee-status');
            committeeStatusDiv.innerHTML = '';
            thesis.committee.forEach(m => {
                if (m.role !== 'Επιβλέπων') {
                    let statusText = m.status === 'accepted' ? `Αποδέχτηκε (${m.date})` : `Εκκρεμεί (Πρόσκληση: ${m.date})`;
                    committeeStatusDiv.innerHTML += `<p>${m.name}: <span class="${m.status === 'accepted' ? 'text-success' : 'text-warning'}">${statusText}</span></p>`;
                }
            });
            if (isSupervisor) {
                document.getElementById('supervisor-actions-under-assignment').style.display = 'block';
            }
        } else if (thesis.status === 'Active') {
            const section = document.getElementById('actions-active');
            section.style.display = 'block';
            // Populate notes
            const notesList = document.getElementById('modal-notes-list');
            notesList.innerHTML = (thesis.notes || []).map(n => `<p class="fst-italic border-start ps-2">"${n.text}"</p>`).join('');
            if (isSupervisor) {
                document.getElementById('supervisor-actions-active').style.display = 'block';
            }
        } else if (thesis.status === 'Under Review') {
            const section = document.getElementById('actions-under-review');
            section.style.display = 'block';
            document.getElementById('view-draft-link').href = thesis.draftLink || '#';
            if (isSupervisor) {
                document.getElementById('supervisor-actions-under-review').style.display = 'block';
            }
        } else if (thesis.status === 'Completed') {
            const section = document.getElementById('actions-completed');
            section.style.display = 'block';
            document.getElementById('modal-final-grade').textContent = thesis.finalGrade || 'N/A';
            document.getElementById('modal-repo-link').href = thesis.repoLink || '#';
            document.getElementById('modal-grading-form-link').href = thesis.gradingFormLink || '#';
        }

        detailsModal.show();
    };

    // --- Event Listeners ---
    filterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        renderTable();
    });

    tableBody.addEventListener('click', (e) => {
        if (e.target.classList.contains('manage-btn')) {
            const thesisId = e.target.closest('tr').dataset.thesisId;
            populateAndShowModal(thesisId);
        }
    });

    // --- Initial Render ---
    renderTable();
});