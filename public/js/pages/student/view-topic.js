document.addEventListener('DOMContentLoaded', () => {
    // This is sample data. Later, this will be fetched from the backend.
    const thesisData = {
        title: 'Σύστημα Υποστήριξης Διπλωματικών Εργασιών',
        description: 'Ανάπτυξη ενός συνεργατικού συστήματος για την υποστήριξη της διοικητικής διαδικασίας εκπόνησης διπλωματικής εργασίας[cite: 5].',
        attachment: {
            name: 'Ergastiriaki_Askisi_24-25-1.0.pdf',
            url: '#'
        },
        status: 'Ενεργή',
        daysAssigned: 180,
        committee: [
            { role: 'Επιβλέπων', name: 'Διδάσκων Α' },
            { role: 'Μέλος', name: 'Διδάσκων Β' },
            { role: 'Μέλος', name: 'Διδάσκων Γ' }
        ]
    };

    /**
     * Populates the view with thesis data.
     * @param {object} data - The thesis data object.
     */
    function populateThesisData(data) {
        document.getElementById('thesis-title').textContent = data.title;
        document.getElementById('thesis-description').textContent = data.description;
        
        const attachmentLink = document.getElementById('thesis-attachment');
        attachmentLink.textContent = data.attachment.name;
        attachmentLink.href = data.attachment.url;

        const statusBadge = document.getElementById('thesis-status');
        statusBadge.textContent = data.status;
        statusBadge.classList.add('bg-primary'); // Or 'bg-success', 'bg-warning', etc. based on status

        document.getElementById('thesis-days').textContent = data.daysAssigned;

        const committeeList = document.getElementById('committee-list');
        committeeList.innerHTML = ''; // Clear existing list items
        data.committee.forEach(member => {
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item';
            listItem.innerHTML = `<i class="bi bi-person-fill me-2"></i><strong>${member.role}:</strong> ${member.name}`;
            committeeList.appendChild(listItem);
        });
    }

    // Load the data into the page
    populateThesisData(thesisData);
});