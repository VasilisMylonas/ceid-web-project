document.addEventListener('DOMContentLoaded', function () {
    const thesesData = [
        { id: 1, title: 'Σύστημα Υποστήριξης ΔΕ', status: 'active' },
        { id: 2, title: 'Τεχνητή Νοημοσύνη στην Ιατρική', status: 'under_examination' },
        { id: 3, title: 'Ανάπτυξη Εφαρμογών για Κινητά', status: 'active' }
    ];

    const thesisSelectionForm = document.getElementById('thesis-selection-form');
    const thesisSelect = document.getElementById('thesis-select');
    const managementSections = document.getElementById('management-sections');
    const stateActiveCard = document.getElementById('state-active');
    const stateExaminationCard = document.getElementById('state-under-examination');

    thesesData.forEach(thesis => {
        const option = document.createElement('option');
        option.value = thesis.id;
        option.textContent = `${thesis.title} (${thesis.status === 'active' ? 'Ενεργή' : 'Υπό Εξέταση'})`;
        thesisSelect.appendChild(option);
    });

    thesisSelectionForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const selectedThesisId = thesisSelect.value;
        if (!selectedThesisId || selectedThesisId === 'disabled') {
            managementSections.style.display = 'none';
            return;
        }

        const selectedThesis = thesesData.find(t => t.id === parseInt(selectedThesisId));
        if (!selectedThesis) return;

        stateActiveCard.style.display = 'none';
        stateExaminationCard.style.display = 'none';

        managementSections.style.display = 'block';

        if (selectedThesis.status === 'active') {
            stateActiveCard.style.display = 'block';
        } else if (selectedThesis.status === 'under_examination') {
            stateExaminationCard.style.display = 'block';
        }
    });
});