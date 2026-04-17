if (document.querySelectorAll('.favorite-btn').length > 0) {
     document.addEventListener('DOMContentLoaded', function() {
        console.log('Favorite buttons found:', document.querySelectorAll('.favorite-btn').length);
        
        document.querySelectorAll('.favorite-btn').forEach(function(button) {
            button.addEventListener('click', function() {
                var livestockId = this.dataset.id;
                var btn = this;
                var csrfTokenElement = document.querySelector('[name=csrfmiddlewaretoken]') || document.querySelector('meta[name="csrf-token"]');
                var csrfToken = csrfTokenElement ? (csrfTokenElement.value || csrfTokenElement.content) : '';
                
                if (!csrfToken) {
                    console.error('CSRF token not found!');
                    showToast("Error: Security token missing");
                    return;
                }
                
                console.log('Toggle favorite for ID:', livestockId);
                
                btn.disabled = true;
                btn.style.opacity = '0.6';

                fetch('/toggle-favorite/' + livestockId + '/', {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': csrfToken,
                        'Content-Type': 'application/json',
                    },
                })
                .then(function(response) { 
                    console.log('Response status:', response.status);
                    if (!response.ok) {
                        throw new Error('Network response was not ok: ' + response.status);
                    }
                    return response.json(); 
                })
                .then(function(data) {
                    console.log('Response data:', data);
                    if (data.status === "removed") {
                        btn.classList.remove("active");
                        showToast("Removed from favorites");
                        
                        if (window.location.pathname.includes('/myfavorites/') || window.location.pathname.includes('/favorites/')) {
                            var card = btn.closest('.result-card') || btn.closest('.livestock-card') || btn.closest('.ox-card');
                            var grid = document.querySelector('.results-grid') || document.querySelector('.livestock-grid') || document.querySelector('.ox-grid');
                            
                            if (card) {
                                card.style.opacity = '0';
                                card.style.transform = 'translateX(100%)';
                                card.style.transition = 'all 0.3s ease';
                                
                                setTimeout(function() {
                                    card.remove();
                                    var remainingCards = document.querySelectorAll('.result-card, .livestock-card, .ox-card');
                                    if (remainingCards.length === 0 && grid) {
                                        grid.innerHTML = `
                                            <div class="empty-state">
                                                <i class="fas fa-heart"></i>
                                                <h2>No Favorites Yet</h2>
                                                <p>You haven't added any livestock to your favorites.</p>
                                                <p class="try-suggestion">Browse our livestock listings to find your perfect match</p>
                                                <a href="/livestock/" class="back-home">
                                                    <i class="fas fa-paw"></i> Browse Livestock
                                                </a>
                                            </div>
                                        `;
                                    } else if (remainingCards.length > 0) {
                                        window.location.reload();
                                    }
                                }, 300);
                            } else {
                                window.location.reload();
                            }
                        }
                    } else if (data.status === "added") {
                        btn.classList.add("active");
                        showToast("Added to favorites");
                    }
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    showToast("Error updating favorite: " + error.message);
                })
                .finally(function() {
                    btn.disabled = false;
                    btn.style.opacity = '1';
                });
            });
        });

        function showToast(message) {
            var toast = document.createElement("div");
            toast.className = "toast-message";
            toast.innerText = message;
            toast.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #333;
                color: white;
                padding: 1rem 1.5rem;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 10000;
                animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s forwards;
            `;
            document.body.appendChild(toast);

            if (!document.querySelector('#toast-styles')) {
                var style = document.createElement('style');
                style.id = 'toast-styles';
                style.textContent = `
                    @keyframes slideIn {
                        from { transform: translateX(100%); opacity: 0; }
                        to { transform: translateX(0); opacity: 1; }
                    }
                    @keyframes fadeOut {
                        from { opacity: 1; }
                        to { opacity: 0; transform: translateX(100%); }
                    }
                `;
                document.head.appendChild(style);
            }

            setTimeout(function() {
                toast.remove();
            }, 2000);
        }
    });
}
