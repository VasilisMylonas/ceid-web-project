document.addEventListener('DOMContentLoaded', function () {
    // This is where you will get the state from your backend.
    // For now, we will simulate it with a variable.
    // You can change this value to 'assignment', 'examination', or 'completed' to test.
    const currentThesisState = 'examination'; // <-- CHANGE THIS TO TEST DIFFERENT STATES

    // This is where you would get the thesis data from your backend.
    // For now, we use the sample data hardcoded in the HTML.
    // In the future, you would pass this data to the render function.
    const thesisData = {
        // Example data structure
        committee: [
            { name: 'Καθηγητής Α. Αλεξίου', role: 'Επιβλέπων', status: 'accepted' },
            { name: 'Καθηγητής Β. Βασιλείου', role: 'Μέλος', status: 'pending' },
            { name: 'Καθηγητής Γ. Γεωργίου', role: 'Μέλος', status: 'rejected' }
        ],
        examDetails: {
            type: 'online', // 'online' or 'in-person'
            date: '2024-09-15',
            time: '11:00',
            location: '' // Set to empty string to see the placeholder
        },
        links: 'https://github.com/my-username/my-thesis-repo',
        nimertisUrl: ''
    };

    /**
     * Renders the appropriate section of the page based on the thesis state.
     * @param {string} state - The current state of the thesis ('assignment', 'examination', 'completed').
     * @param {object} data - The data object for the thesis.
     */
    function renderThesisState(state, data) {
        // Hide all state sections first
        document.getElementById('state-assignment').style.display = 'none';
        document.getElementById('state-examination').style.display = 'none';
        document.getElementById('state-completed').style.display = 'none';

        // Show the section that matches the current state
        switch (state) {
            case 'assignment':
                document.getElementById('state-assignment').style.display = 'block';
                // Future enhancement: Use the 'data' object to dynamically populate the committee list
                break;
            case 'examination':
                document.getElementById('state-examination').style.display = 'block';
                setupExaminationForm(data.examDetails);
                break;
            case 'completed':
                document.getElementById('state-completed').style.display = 'block';
                // Future enhancement: Use the 'data' object to enable/disable the "View Record" button
                break;
            default:
                // If state is unknown, show a message or the first state as a default
                console.error('Unknown thesis state:', state);
                document.getElementById('state-assignment').style.display = 'block';
        }
    }

    /**
     * Sets up the examination form, including event listeners for dynamic fields.
     * @param {object} examDetails - The examination details from the data object.
     */
    function setupExaminationForm(examDetails) {
        const locationLabel = document.querySelector('label[for="examLocation"]');
        const locationInput = document.getElementById('examLocation');

        const updateLocationField = (examType) => {
            if (examType === 'online') {
                locationLabel.textContent = 'Σύνδεσμος Τηλεδιάσκεψης';
                locationInput.placeholder = 'https://teams.microsoft.com/...';
                // Only set value if the original data type matches the selected type
                locationInput.value = examDetails.type === 'online' ? examDetails.location : '';
            } else { // 'in-person'
                locationLabel.textContent = 'Αίθουσα Εξέτασης';
                locationInput.placeholder = 'π.χ. Αίθουσα 1, Κτίριο Β';
                // Only set value if the original data type matches the selected type
                locationInput.value = examDetails.type === 'in-person' ? examDetails.location : '';
            }
        };

        document.querySelectorAll('input[name="examType"]').forEach(radio => {
            radio.addEventListener('change', (event) => {
                updateLocationField(event.target.value);
            });
        });

        // Set initial state based on data
        const initialExamType = examDetails.type || 'online';
        document.querySelector(`input[name="examType"][value="${initialExamType}"]`).checked = true;
        updateLocationField(initialExamType);
    }

    // Initial render when the page loads
    renderThesisState(currentThesisState, thesisData);

});