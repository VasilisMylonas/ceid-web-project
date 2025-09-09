document.addEventListener('DOMContentLoaded', () => {
    // This sample data will later be fetched from your backend API
    const sampleData = {
        freeTopics: [
            { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark' },
            { id: 2, title: 'Ασφάλεια σε Δίκτυα 5G' },
            { id: 4, title: 'Βελτιστοποίηση Βάσεων Δεδομένων Γράφων' }
        ],
        allMyTopics: [
            { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', status: 'Ελεύθερο', student: null },
            { id: 3, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', status: 'Υπό Ανάθεση', student: 'Γιάννης Παπαδόπουλος' },
            { id: 2, title: 'Ασφάλεια σε Δίκτυα 5G', status: 'Ελεύθερο', student: null },
            { id: 5, title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα', status: 'Ενεργή', student: 'Μαρία Σταύρου' }
        ]
    };

    const topicSelect = document.getElementById('topicSelect');
    const myTopicsTableBody = document.getElementById('my-topics-table-body');

    // --- 1. Populate the "Free Topics" dropdown ---
    if (topicSelect) {
        sampleData.freeTopics.forEach(topic => {
            const option = document.createElement('option');
            option.value = topic.id;
            option.textContent = topic.title;
            topicSelect.appendChild(option);
        });
    }

    // --- 2. Populate the "My Topics" table ---
    if (myTopicsTableBody) {
        myTopicsTableBody.innerHTML = ''; // Clear any static content
        sampleData.allMyTopics.forEach(topic => {
            const row = document.createElement('tr');

            let statusBadge;
            if (topic.status === 'Ελεύθερο') {
                statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;
            } else if (topic.status === 'Υπό Ανάθεση') {
                statusBadge = `<span class="badge bg-warning">Υπό Ανάθεση</span>`;
            } else {
                statusBadge = `<span class="badge bg-primary">Ενεργή</span>`;
            }

            row.innerHTML = `
                <td>${topic.title}</td>
                <td>${statusBadge}</td>
                <td>${topic.student || '-'}</td>
                <td>
                    ${topic.status === 'Ελεύθερο' ? '<a href="#" class="btn btn-sm btn-secondary">Επεξεργασία</a>' : ''}
                    ${topic.status === 'Υπό Ανάθεση' ? '<button class="btn btn-sm btn-danger">Ανάκληση</button>' : ''}
                </td>
            `;
            myTopicsTableBody.appendChild(row);
        });
    }
});