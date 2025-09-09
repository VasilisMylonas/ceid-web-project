document.addEventListener('DOMContentLoaded', () => {
    // This sample data will later be fetched from your backend API
    const sampleData = {
        allMyTopics: [
            { id: 1, title: 'Ανάλυση Μεγάλων Δεδομένων με Spark', description: 'Αυτή είναι η περιγραφή για την ανάλυση μεγάλων δεδομένων.', status: 'Ελεύθερο', student: null },
            { id: 3, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', description: 'Αυτή είναι η περιγραφή για την ΤΝ στην ιατρική.', status: 'Υπό Ανάθεση', student: 'Γιάννης Παπαδόπουλος' },
            { id: 5, title: 'Μηχανική Μάθηση για Ενσωματωμένα Συστήματα', description: 'Αυτή είναι η περιγραφή για την μηχανική μάθηση.', status: 'Ενεργή', student: 'Μαρία Σταύρου' }
        ]
    };

    // --- Element Selectors ---
    const myTopicsTableBody = document.getElementById('my-topics-table-body');
    const showCreateFormBtn = document.getElementById('show-create-form-btn');
    const createTopicCard = document.getElementById('create-topic-card');
    const cancelCreateBtn = document.getElementById('cancel-create-btn');
    
    // Details Modal elements
    const topicDetailsModal = new bootstrap.Modal(document.getElementById('topic-details-modal'));
    const modalTopicId = document.getElementById('modal-topic-id');
    const modalTopicTitle = document.getElementById('modal-topic-title');
    const modalTopicDescription = document.getElementById('modal-topic-description');
    const modalTopicFile = document.getElementById('modal-topic-file');
    const editBtn = document.getElementById('edit-topic-btn');
    const saveBtn = document.getElementById('save-topic-btn');

    // Assign Modal elements
    const assignStudentModal = new bootstrap.Modal(document.getElementById('assign-student-modal'));
    const assignStudentForm = document.getElementById('assign-student-form');
    const assignTopicIdInput = document.getElementById('assign-topic-id');
    const assignTopicTitle = document.getElementById('assign-topic-title');

    // --- Functions ---
    const renderTopicsTable = () => {
        myTopicsTableBody.innerHTML = ''; // Clear table
        sampleData.allMyTopics.forEach(topic => {
            const row = document.createElement('tr');
            row.setAttribute('data-topic-id', topic.id);

            let statusBadge;
            if (topic.status === 'Ελεύθερο') statusBadge = `<span class="badge bg-success">Ελεύθερο</span>`;
            else if (topic.status === 'Υπό Ανάθεση') statusBadge = `<span class="badge bg-warning">Υπό Ανάθεση</span>`;
            else statusBadge = `<span class="badge bg-primary">Ενεργή</span>`;

            const actions = `
                <button class="btn btn-sm btn-outline-secondary view-details-btn">Λεπτομέρειες</button>
                ${topic.status === 'Ελεύθερο' ? '<button class="btn btn-sm btn-primary assign-btn ms-1">Ανάθεση</button>' : ''}
            `;

            row.innerHTML = `
                <td>${topic.title}</td>
                <td>${statusBadge}</td>
                <td>${topic.student || '-'}</td>
                <td>${actions}</td>
            `;
            myTopicsTableBody.appendChild(row);
        });
    };

    const setModalState = (isEditing) => {
        modalTopicTitle.readOnly = !isEditing;
        modalTopicDescription.readOnly = !isEditing;
        modalTopicFile.disabled = !isEditing;
        editBtn.style.display = isEditing ? 'none' : 'block';
        saveBtn.style.display = isEditing ? 'block' : 'none';
    };

    // --- Event Listeners ---
    showCreateFormBtn.addEventListener('click', () => {
        createTopicCard.style.display = 'block';
        showCreateFormBtn.style.display = 'none';
    });

    cancelCreateBtn.addEventListener('click', () => {
        createTopicCard.style.display = 'none';
        showCreateFormBtn.style.display = 'block';
    });

    myTopicsTableBody.addEventListener('click', (e) => {
        const topicId = e.target.closest('tr')?.dataset.topicId;
        if (!topicId) return;

        const topic = sampleData.allMyTopics.find(t => t.id == topicId);
        if (!topic) return;

        if (e.target.classList.contains('view-details-btn')) {
            modalTopicId.value = topic.id;
            modalTopicTitle.value = topic.title;
            modalTopicDescription.value = topic.description;
            setModalState(false);
            topicDetailsModal.show();
        } else if (e.target.classList.contains('assign-btn')) {
            assignTopicIdInput.value = topic.id;
            assignTopicTitle.textContent = topic.title;
            assignStudentModal.show();
        }
    });

    editBtn.addEventListener('click', () => setModalState(true));

    saveBtn.addEventListener('click', () => {
        // Simulate save
        setModalState(false);
        topicDetailsModal.hide();
    });

    assignStudentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const topicId = assignTopicIdInput.value;
        const studentIdentifier = e.target.elements.studentIdentifier.value;
        
        console.log(`Assigning topic ID ${topicId} to student: ${studentIdentifier}`);
        
        // Find and update the topic in the sample data
        const topic = sampleData.allMyTopics.find(t => t.id == topicId);
        if (topic) {
            topic.status = 'Υπό Ανάθεση';
            topic.student = studentIdentifier; // In a real app, you'd use the student's full name
        }
        
        assignStudentModal.hide();
        renderTopicsTable(); // Re-render the table to show the change
        e.target.reset();
    });

    // --- Initial Page Load ---
    renderTopicsTable();
});