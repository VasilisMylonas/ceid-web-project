document.addEventListener('DOMContentLoaded', function () {
    // Sample data that would be fetched from the backend
    const thesesData = [
        { id: 1, title: 'Σύστημα Υποστήριξης ΔΕ', student: 'Γιάννης Παπαδόπουλος', supervisor: 'Δρ. Α. Γεωργίου', status: 'active' },
        { id: 2, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', student: 'Μαρία Σταύρου', supervisor: 'Δρ. Ε. Καραγιάννης', status: 'under_examination' },
        { id: 3, title: 'Ανάπτυξη Εφαρμογών για Κινητά', student: 'Νίκος Δημητρίου', supervisor: 'Δρ. Π. Βασιλείου', status: 'active' }
    ];

    const tableBody = document.getElementById('management-theses-table-body');
    const managementSections = document.getElementById('management-sections');
    const stateActiveCard = document.getElementById('state-active');
    const stateExaminationCard = document.getElementById('state-under-examination');
    const cancelAssignmentBtn = document.getElementById('cancel-assignment-btn');

    // Function to render the selection table
    const renderTable = (theses) => {
        tableBody.innerHTML = ''; // Clear existing rows
        theses.forEach(thesis => {
            const row = document.createElement('tr');
            row.style.cursor = 'pointer';
            row.setAttribute('data-thesis-id', thesis.id);

            const statusBadge = thesis.status === 'active'
                ? `<span class="badge bg-primary">Ενεργή</span>`
                : `<span class="badge bg-warning text-dark">Υπό Εξέταση</span>`;

            row.innerHTML = `
                <td>${thesis.title}</td>
                <td>${thesis.student}</td>
                <td>${thesis.supervisor}</td>
                <td>${statusBadge}</td>
            `;
            tableBody.appendChild(row);
        });
    };

    // Function to show the correct management card
    const showManagementCard = (thesisId) => {
        const selectedThesis = thesesData.find(t => t.id === parseInt(thesisId));
        if (!selectedThesis) return;

        // Highlight the selected row
        document.querySelectorAll('#management-theses-table-body tr').forEach(tr => {
            tr.classList.remove('table-active');
        });
        document.querySelector(`[data-thesis-id="${thesisId}"]`).classList.add('table-active');

        // Hide all cards first
        stateActiveCard.style.display = 'none';
        stateExaminationCard.style.display = 'none';

        // Show the main container and the correct card
        managementSections.style.display = 'block';
        if (selectedThesis.status === 'active') {
            stateActiveCard.style.display = 'block';
        } else if (selectedThesis.status === 'under_examination') {
            stateExaminationCard.style.display = 'block';
        }
    };

    // Add event listener to the table body for row clicks
    tableBody.addEventListener('click', (event) => {
        const row = event.target.closest('tr');
        if (row && row.dataset.thesisId) {
            showManagementCard(row.dataset.thesisId);
        }
    });

    // Add event listener for the cancellation button
    if (cancelAssignmentBtn) {
        cancelAssignmentBtn.addEventListener('click', () => {
            // In a real app, you would send the cancellation reason to the backend here.
            
            // Hide the management section
            managementSections.style.display = 'none';

            // Deselect the active row in the table
            const activeRow = document.querySelector('#management-theses-table-body tr.table-active');
            if (activeRow) {
                activeRow.classList.remove('table-active');
            }

            // Clear the input field for the next use
            const reasonInput = document.getElementById('cancellation-reason');
            if(reasonInput) {
                reasonInput.value = '';
            }
        });
    }

    // Initial render of the table on page load
    renderTable(thesesData);
});