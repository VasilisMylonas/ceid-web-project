// Sidebar collapse functionality
(function () {
    const body = document.body;
    const toggleButton = document.getElementById('sidebar-toggle');
    const STORAGE_KEY_COLLAPSED = 'sidebar-collapsed';

    // Apply collapsed state on page load
    if (localStorage.getItem(STORAGE_KEY_COLLAPSED) === 'true') {
        body.classList.add('sidebar-collapsed');
    }

    // Toggle sidebar on button click
    if (toggleButton) {
        toggleButton.addEventListener('click', () => {
            body.classList.toggle('sidebar-collapsed');
            // Save the state to localStorage
            localStorage.setItem(STORAGE_KEY_COLLAPSED, body.classList.contains('sidebar-collapsed'));
        });
    }

    // --- Dynamic Sidebar Menu ---
    const menuItems = [
        { href: 'view-thesis-secretary.html', icon: 'bi-journal-text', text: 'Προβολή Διπλωματικών' },
        { href: 'data-entry-secretary.html', icon: 'bi-pencil-square', text: 'Καταχώρηση Δεδομένων' },
        { href: 'manage-thesis-secretary.html', icon: 'bi-file-earmark-check', text: 'Διαχείριση Διπλωματικών' }
    ];
    const sidebarMenu = document.querySelector('.sidebar-menu');
    if (sidebarMenu) {
        menuItems.forEach(item => {
            const li = document.createElement('li');
            li.className = 'nav-item';

            const a = document.createElement('a');
            a.href = item.href;
            a.className = 'nav-link d-flex align-items-center';
            a.innerHTML = `
                <i class="bi ${item.icon} icon me-2"></i>
                <span>${item.text}</span>
            `;

            li.appendChild(a);
            sidebarMenu.appendChild(li);
        });
    }

    // --- Set "active" class on the current page's sidebar link ---
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link');

    navLinks.forEach(link => {
        const linkPage = link.getAttribute('href').split('/').pop();
        if (linkPage === currentPage) {
            link.classList.add('active');
            if (link.parentElement) {
                link.parentElement.classList.add('active');
            }
        }
    });
})();