document.addEventListener('DOMContentLoaded', () => {
    // Sample data that would be fetched from a backend
    const profileData = {
        address: 'Οδός Πανεπιστημίου 1, Πάτρα, 26504',
        email: 'student@upatras.gr',
        mobilePhone: '6901234567',
        homePhone: '2610987654'
    };

    /**
     * Populates the form with user profile data.
     * @param {object} data - The user profile data.
     */
    function populateProfileData(data) {
        document.getElementById('address').value = data.address;
        document.getElementById('email').value = data.email;
        document.getElementById('mobilePhone').value = data.mobilePhone;
        document.getElementById('homePhone').value = data.homePhone;
    }

    // Load the initial data into the form
    populateProfileData(profileData);

    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('click', (e) => {
        const button = e.target.closest('.edit-btn');
        if (!button) return;

        const targetInputId = button.dataset.target;
        const input = document.getElementById(targetInputId);
        if (!input) return;

        const isReadOnly = input.hasAttribute('readonly');

        if (isReadOnly) {
            // Switch to edit mode
            input.removeAttribute('readonly');
            input.focus();
            input.select();

            button.innerHTML = '<i class="bi bi-save"></i>'; // Change icon to save
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-success');
        } else {
            // Switch to save mode
            input.setAttribute('readonly', true);

            button.innerHTML = '<i class="bi bi-pencil"></i>'; // Change icon back to pencil
            button.classList.remove('btn-success');
            button.classList.add('btn-outline-secondary');

            // Here you would typically send the data to a server
            console.log(`"Saved" ${targetInputId}: ${input.value}`);
        }
    });
});