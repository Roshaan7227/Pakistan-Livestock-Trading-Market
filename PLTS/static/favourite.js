if (document.querySelectorAll('.favorite-btn').length > 0) {
    document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('.favorite-btn').forEach(function(button) {
            button.addEventListener('click', function() {
                var livestockId = this.dataset.id;
                var btn = this;
                    
                var csrfTokenElement = document.querySelector('[name=csrfmiddlewaretoken]');
                var csrfToken = csrfTokenElement ? csrfTokenElement.value : '';
                
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
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json(); 
                })
                .then(function(data) {
                    if (data.status === "removed") {
                        btn.classList.remove("active");
                        var favText = btn.querySelector('#favText');
                        if (favText) {
                            favText.textContent = 'Add to Favorites';
                        }
                        showToast("Removed from favorites");
                        
                        if (window.location.pathname.includes('/myfavorites/') || window.location.pathname.includes('/favorites/')) {
                            var card = btn.closest('.result-card') || btn.closest('.livestock-card');
                            if (card) {
                                card.style.opacity = '0';
                                card.style.transform = 'translateX(100%)';
                                setTimeout(function() {
                                    card.remove();
                                    var allCards = document.querySelectorAll('.result-card, .livestock-card');
                                    var grid = document.querySelector('.results-grid') || document.querySelector('.livestock-grid');
                                    if (allCards.length === 0 && grid) {
                                        grid.innerHTML = `
                                            <div class="no-favorites">
                                                <div class="empty-state">
                                                    <i class="fas fa-heart" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></i>
                                                    <h2>No Favorites Yet</h2>
                                                    <p>You haven't added any livestock to your favorites.</p>
                                                    <a href="/livestock/" class="back-home">
                                                        <i class="fas fa-paw"></i> Browse Livestock
                                                    </a>
                                                </div>
                                            </div>
                                        `;
                                    }
                                }, 300);
                            }
                        }
                    } else if (data.status === "added") {
                        btn.classList.add("active");
                        var favText = btn.querySelector('#favText');
                        if (favText) {
                            favText.textContent = 'Remove from Favorites';
                        }
                        showToast("Added to favorites");
                    }
                })
                .catch(function(error) {
                    console.error('Error:', error);
                    showToast("Error updating favorite");
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
