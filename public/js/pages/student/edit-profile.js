document.addEventListener('DOMContentLoaded', async () => {
    /**
     * Fetches profile data from the backend.
     * @returns {Promise<object|null>} The user profile data or null on error.
     */
    async function getProfileData() {
        try {
            const response = await getProfile();
            
            // The actual profile is nested inside the 'data' property
            if (!response || !response.data) {
                console.error("getProfileData: Profile object not found in API response.");
                return null;
            }
            const profile = response.data;
            
            let name = '';
            let surname = '';
            if (profile.name) {
                const nameParts = profile.name.split(' ');
                name = nameParts[0];
                surname = nameParts.slice(1).join(' ');
            }

            return {
                ...profile, // Spread the actual profile object
                name: name,
                surname: surname,
                // Extract the student ID from the nested Student object
                studentId: profile.Student ? profile.Student.am : '',
            };
        } catch (error) {
            console.error('Error fetching profile data:', error);
            // You might want to show an error message to the user
            return null;
        }
    }

    /**
     * Populates the form with user profile data.
     * @param {object} data - The user profile data.
     */
    function populateProfileData(data) {
        if (!data) return;
        // Populate static info
        document.getElementById('student-name').textContent = data.name || '';
        document.getElementById('student-surname').textContent = data.surname || '';
        document.getElementById('student-id').textContent = data.studentId || '';

        // Populate editable info
        document.getElementById('address').value = data.address || '';
        document.getElementById('email').value = data.email || '';
        document.getElementById('mobilePhone').value = data.phone || ''; // Backend uses 'phone'
        document.getElementById('homePhone').value = data.homePhone || '';
    }

    // Load the initial data into the form
    const profileData = await getProfileData();
    populateProfileData(profileData);

    const form = document.getElementById('profile-form');
    if (!form) return;

    form.addEventListener('click', async (e) => {
        const button = e.target.closest('.edit-btn');
        if (!button) return;

        const targetInputId = button.dataset.target;
        const input = document.getElementById(targetInputId);
        if (!input) return;

        const isReadOnly = input.hasAttribute('readonly');

        if (isReadOnly) {
            // Switch to edit mode
            // Clear any previous validation errors
            input.classList.remove('is-invalid');
            const errorDiv = input.closest('.input-group').nextElementSibling;
            if (errorDiv) {
                errorDiv.textContent = '';
            }

            input.removeAttribute('readonly');
            input.focus();
            input.select();

            button.innerHTML = '<i class="bi bi-save"></i>'; // Change icon to save
            button.classList.remove('btn-outline-secondary');
            button.classList.add('btn-success');
        } else {
            // --- VALIDATION LOGIC ---
            const fieldName = targetInputId === 'mobilePhone' ? 'phone' : targetInputId;
            const value = input.value;
            let isValid = true;
            let errorMessage = '';

            if (fieldName === 'email') {
                const emailRegex = /^\S+@\S+\.\S+$/;
                if (!emailRegex.test(value)) {
                    isValid = false;
                    errorMessage = 'Please enter a valid email address (e.g., user@example.com).';
                }
            } else if (fieldName === 'phone' || fieldName === 'homePhone') {
                const phoneRegex = /^[0-9]{10}$/;
                if (value && !phoneRegex.test(value)) { // Allow empty value for optional fields
                    isValid = false;
                    errorMessage = 'Phone number must be exactly 10 digits.';
                }
            }

            const errorDiv = input.closest('.input-group').nextElementSibling;

            if (isValid) {
                // --- SAVE LOGIC ---
                input.classList.remove('is-invalid');
                if(errorDiv) errorDiv.textContent = '';

                input.setAttribute('readonly', true);
                button.innerHTML = '<i class="bi bi-pencil"></i>';
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-secondary');

                const body = { [fieldName]: value };
                try {
                    await updateProfile(body);
                    console.log(`Saved ${targetInputId}: ${value}`);
                } catch (error) {
                    console.error(`Error saving ${targetInputId}:`, error);
                }
            } else {
                // --- SHOW ERROR ---
                input.classList.add('is-invalid');
                if(errorDiv) errorDiv.textContent = errorMessage;
            }
        }
    });
});