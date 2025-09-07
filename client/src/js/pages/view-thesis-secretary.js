document.addEventListener('DOMContentLoaded', function () {
    // This check ensures the script only runs on the correct page.
    if (document.getElementById('theses-table-body')) {
        // --- Sample Data (to be replaced by backend API calls) ---
        const thesesData = [
            {
                id: 1,
                topic: 'Σύστημα Υποστήριξης ΔΕ',
                description: 'Ανάπτυξη ενός ολοκληρωμένου συστήματος για την υποστήριξη της διαδικασίας των διπλωματικών εργασιών στο τμήμα, καλύπτοντας τις ανάγκες φοιτητών, καθηγητών και γραμματείας.',
                student: 'Γιάννης Παπαδόπουλος',
                supervisor: 'Δρ. Α. Γεωργίου',
                status: 'Ενεργή',
                assignmentDate: '2024-03-12',
                committee: [
                    { name: 'Δρ. Α. Γεωργίου', role: 'Επιβλέπων' },
                    { name: 'Δρ. Π. Βασιλείου', role: 'Μέλος' },
                    { name: 'Δρ. Ε. Καραγιάννης', role: 'Μέλος' }
                ]
            },
            {
                id: 2,
                topic: 'Τεχνητή Νοημοσύνη στην Ιατρική',
                description: 'Διερεύνηση της εφαρμογής αλγορίθμων μηχανικής μάθησης για την έγκαιρη διάγνωση ασθενειών μέσω της ανάλυσης ιατρικών εικόνων, όπως μαγνητικές τομογραφίες.',
                student: 'Μαρία Σταύρου',
                supervisor: 'Δρ. Ε. Καραγιάννης',
                status: 'Υπό Εξέταση',
                assignmentDate: '2024-01-05',
                committee: [
                    { name: 'Δρ. Ε. Καραγιάννης', role: 'Επιβλέπων' },
                    { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' },
                    { name: 'Δρ. Κ. Νικολάου', role: 'Μέλος' }
                ]
            },
            {
                id: 3,
                topic: 'Ανάπτυξη Εφαρμογών για Κινητά',
                description: 'Σχεδιασμός και υλοποίηση μιας cross-platform εφαρμογής για κινητά τηλέφωνα με σκοπό την οργάνωση προσωπικών οικονομικών.',
                student: 'Νίκος Δημητρίου',
                supervisor: 'Δρ. Π. Βασιλείου',
                status: 'Ενεργή',
                assignmentDate: '2024-02-20',
                committee: [
                    { name: 'Δρ. Π. Βασιλείου', role: 'Επιβλέπων' },
                    { name: 'Δρ. Μ. Παπαδάκη', role: 'Μέλος' },
                    { name: 'Δρ. Α. Γεωργίου', role: 'Μέλος' }
                ]
            }
        ];

        const tableBody = document.getElementById('theses-table-body');
        const thesisModal = new bootstrap.Modal(document.getElementById('thesisDetailsModal'));

        // Function to render the table
        const renderTable = (theses) => {
            tableBody.innerHTML = ''; // Clear existing rows
            theses.forEach(thesis => {
                const row = document.createElement('tr');
                row.style.cursor = 'pointer';
                row.setAttribute('data-thesis-id', thesis.id);

                const statusBadge = thesis.status === 'Ενεργή'
                    ? `<span class="badge bg-primary">${thesis.status}</span>`
                    : `<span class="badge bg-warning text-dark">${thesis.status}</span>`;

                row.innerHTML = `
                    <td>${thesis.topic}</td>
                    <td>${thesis.student}</td>
                    <td>${thesis.supervisor}</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(thesis.assignmentDate).toLocaleDateString('el-GR')}</td>
                `;
                tableBody.appendChild(row);
            });
        };

        // Function to show details in the modal
        const showDetails = (thesisId) => {
            const thesis = thesesData.find(t => t.id === parseInt(thesisId));
            if (!thesis) return;

            document.getElementById('modal-thesis-topic').textContent = thesis.topic;
            
            const statusElement = document.getElementById('modal-thesis-status');
            const statusBadge = thesis.status === 'Ενεργή'
                ? `<span class="badge bg-primary">${thesis.status}</span>`
                : `<span class="badge bg-warning text-dark">${thesis.status}</span>`;
            statusElement.innerHTML = `Κατάσταση: ${statusBadge}`;

            document.getElementById('modal-thesis-student').textContent = thesis.student;
            document.getElementById('modal-thesis-assignment-date').textContent = new Date(thesis.assignmentDate).toLocaleDateString('el-GR');
            document.getElementById('modal-thesis-description').textContent = thesis.description;

            const committeeList = document.getElementById('modal-committee-list');
            committeeList.innerHTML = '';
            thesis.committee.forEach(member => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    ${member.name}
                    <span class="badge bg-secondary">${member.role}</span>
                `;
                committeeList.appendChild(li);
            });

            thesisModal.show();
        };

        // Add event listener to the table body
        tableBody.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            if (row && row.dataset.thesisId) {
                showDetails(row.dataset.thesisId);
            }
        });

        // Initial render
        renderTable(thesesData);
    }
});