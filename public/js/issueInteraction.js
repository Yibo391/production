document.addEventListener('DOMContentLoaded', () => {
    const issueItems = document.querySelectorAll('.list-group-item');
    issueItems.forEach(item => {
        item.addEventListener('click', (e) => {
            if (!item.classList.contains('active')) {
                // Remove active class from any other active items
                issueItems.forEach(i => i.classList.remove('active'));

                // Add active class to clicked item
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    });

    // Close issue detail when clicking outside of an active issue
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.list-group-item')) {
            issueItems.forEach(i => i.classList.remove('active'));
        }
    });
});
