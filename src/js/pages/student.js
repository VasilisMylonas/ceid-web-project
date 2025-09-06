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
})();

// Toggle sidebar "active" class and remember selection in localStorage
(function () {
    const navItems = document.querySelectorAll('.sidebar-menu .nav-item');
    const navLinks = document.querySelectorAll('.sidebar-menu .nav-link, .sidebar-footer .nav-link');
    const STORAGE_KEY = 'student-active-page';

    function setActiveByPage(page) {
        navItems.forEach(item => {
            if (item.dataset.page === page) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    // Determine the current page from the URL to set the active state correctly on load
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '');
    const pageToSet = (currentPage === 'student' || currentPage === '') ? 'view-topic' : currentPage;
    
    if (pageToSet) {
        setActiveByPage(pageToSet);
        localStorage.setItem(STORAGE_KEY, pageToSet);
    }

    // Click handlers — persist and then navigate
    navLinks.forEach(link => link.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent the link from navigating to "#"
        const parentItem = link.closest('.nav-item');
        if (!parentItem) return;

        const page = parentItem.dataset.page;

        // Persist the selection first
        try {
            if (page !== 'sign-out') {
                localStorage.setItem(STORAGE_KEY, page);
            } else {
                localStorage.removeItem(STORAGE_KEY);
            }
        } catch (err) {
            console.error(err);
        }

        // Navigate
        switch (page) {
            case 'sign-out':
                window.location.href = 'login.html';
                break;
            case 'view-topic':
                window.location.href = 'view-topic.html';
                break;
            case 'edit-profile':
                window.location.href = 'edit-profile.html';
                break;
            case 'manage-thesis':
                window.location.href = 'manage-thesis.html';
                break;
            // For pages without redirection, just set active class
            default:
                setActiveByPage(page);
                break;
        }
    }));
})();