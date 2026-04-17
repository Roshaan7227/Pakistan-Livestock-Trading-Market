document.addEventListener('DOMContentLoaded', function() {
    var scrollBtn = document.getElementById('scrollTopBtn');
    
    if (scrollBtn) {
        window.onscroll = function() {
            if (document.body.scrollTop > 200 || document.documentElement.scrollTop > 200) {
                scrollBtn.style.display = 'flex';
            } else {
                scrollBtn.style.display = 'none';
            }
        };
    }
});

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}