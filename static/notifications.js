document.addEventListener('DOMContentLoaded', function() {

    const bell = document.getElementById('notificationBell');
    if (!bell) return;
    
    const dropdown = document.getElementById('notificationDropdown');
    const notificationCount = document.getElementById('notificationCount');
    const notificationList = document.getElementById('notificationList');
    const markAllBtn = document.getElementById('markAllRead');
    
    let isDropdownOpen = false;
    let allNotifications = []; 
    
    
    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }
    
    function fetchNotifications() {
        fetch('/notifications/')
            .then(response => response.json())
            .then(data => {
                
                const unreadCount = data.count;
                if (unreadCount > 0) {
                    notificationCount.textContent = unreadCount;
                    notificationCount.style.display = 'inline-block';
                } else {
                    notificationCount.style.display = 'none';
                }
                
                allNotifications = data.notifications;
                
                if (isDropdownOpen) {
                    renderNotifications(allNotifications);
                }
            })
            .catch(error => console.error('Error fetching notifications:', error));
    }
    
    function deleteNotification(notificationId, event) {
        event.stopPropagation();
        
        if (!confirm('Delete this notification?')) return;
        
        fetch(`/notifications/delete/${notificationId}/`, {
            method: 'DELETE',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(() => {
            allNotifications = allNotifications.filter(n => n.id !== notificationId);
            
            renderNotifications(allNotifications);
            
            const newUnreadCount = allNotifications.filter(n => !n.is_read).length;
            if (newUnreadCount > 0) {
                notificationCount.textContent = newUnreadCount;
                notificationCount.style.display = 'inline-block';
            } else {
                notificationCount.style.display = 'none';
            }
        })
        .catch(error => console.error('Error deleting notification:', error));
    }
    
    function showLivestockDetails(livestockId, notificationId) {
        markNotificationRead(notificationId, false);
        
        fetch(`/api/livestock/${livestockId}/`)
            .then(response => response.json())
            .then(data => {
                let modal = document.getElementById('livestockModal');
                if (!modal) {
                    modal = document.createElement('div');
                    modal.id = 'livestockModal';
                    modal.className = 'livestock-modal';
                    document.body.appendChild(modal);
                }
                
                const availabilityClass = data.availability_status === 'available' ? 'status-available' : 'status-sold';
                const availabilityText = data.availability_status === 'available' ? '✅ Available' : '❌ Sold';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <div class="modal-header">
                            <h3>🐄 ${data.breed} - ${data.species}</h3>
                            <button class="modal-close">&times;</button>
                        </div>
                        <div class="modal-body">
                            ${data.image_url ? `<img src="${data.image_url}" alt="${data.breed}">` : '<div class="no-image">No image available</div>'}
                            
                            <div class="livestock-details">
                                <div class="detail-row">
                                    <span class="detail-label">Species:</span>
                                    <span class="detail-value">${data.species}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Breed:</span>
                                    <span class="detail-value">${data.breed}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Age:</span>
                                    <span class="detail-value">${data.age}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Weight:</span>
                                    <span class="detail-value">${data.weight} kg</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Health Status:</span>
                                    <span class="detail-value health-${data.health.toLowerCase()}">${data.health}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Location:</span>
                                    <span class="detail-value">📍 ${data.location}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Price:</span>
                                    <span class="detail-value price">₨ ${parseFloat(data.price).toLocaleString()}</span>
                                </div>
                                <div class="detail-row">
                                    <span class="detail-label">Status:</span>
                                    <span class="detail-value ${availabilityClass}">${availabilityText}</span>
                                </div>
                                ${data.owner_name ? `
                                <div class="detail-row">
                                    <span class="detail-label">Seller:</span>
                                    <span class="detail-value">${data.owner_name}</span>
                                </div>
                                ` : ''}
                                ${data.phone ? `
                                <div class="detail-row">
                                    <span class="detail-label">Contact:</span>
                                    <span class="detail-value">📞 ${data.phone}</span>
                                </div>
                                ` : ''}
                            </div>
                            
                            <div class="modal-actions">
                                <a href="/viewdetails/${data.id}/" class="view-full-details">View Full Details →</a>
                            </div>
                        </div>
                    </div>
                `;
                
                modal.classList.add('show');
                
                modal.querySelector('.modal-close').addEventListener('click', () => {
                    modal.classList.remove('show');
                });
                
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        modal.classList.remove('show');
                    }
                });
            })
            .catch(error => console.error('Error fetching livestock details:', error));
    }
    
    function markNotificationRead(notificationId, refreshView = true) {
        fetch(`/notifications/mark/${notificationId}/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(() => {
            const notification = allNotifications.find(n => n.id === notificationId);
            if (notification) {
                notification.is_read = true;
            }
            
            const unreadCount = allNotifications.filter(n => !n.is_read).length;
            if (unreadCount > 0) {
                notificationCount.textContent = unreadCount;
                notificationCount.style.display = 'inline-block';
            } else {
                notificationCount.style.display = 'none';
            }
            
            if (refreshView && isDropdownOpen) {
                renderNotifications(allNotifications);
            }
        })
        .catch(error => console.error('Error marking notification:', error));
    }
    
    function markAllRead() {
        fetch('/notifications/mark-all/', {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json'
            }
        })
        .then(response => response.json())
        .then(() => {
            allNotifications.forEach(n => {
                n.is_read = true;
            });
            
            notificationCount.style.display = 'none';
            
            if (isDropdownOpen) {
                renderNotifications(allNotifications);
            }
        })
        .catch(error => console.error('Error marking all read:', error));
    }
    
    function renderNotifications(notifications) {
        if (!notificationList) return;
        
        if (notifications.length === 0) {
            notificationList.innerHTML = '<div class="no-notifications">✨ No notifications</div>';
            return;
        }
        
        let html = '';
        notifications.forEach(notif => {
            const isUnread = !notif.is_read;
            const readClass = isUnread ? 'unread' : 'read';
            
            html += `
                <div class="notification-item ${readClass}" data-id="${notif.id}" data-livestock-id="${notif.livestock_id || ''}">
                    <div class="notification-icon">
                        <i class="fas fa-heart" style="color: #e91e63;"></i>
                    </div>
                    <div class="notification-content">
                        <div class="notification-message">${notif.message}</div>
                        <div class="notification-time">${notif.created_at}</div>
                    </div>
                    <div class="notification-actions">
                        <div class="three-dot-menu" data-id="${notif.id}">
                            <i class="fas fa-ellipsis-v"></i>
                            <div class="dropdown-menu" id="menu-${notif.id}" style="display: none;">
                                <button class="delete-notif-btn" data-id="${notif.id}">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        notificationList.innerHTML = html;
        
        document.querySelectorAll('.notification-item').forEach(item => {
            const livestockId = item.getAttribute('data-livestock-id');
            const notificationId = parseInt(item.getAttribute('data-id'));
            const notification = allNotifications.find(n => n.id === notificationId);
            
            if (livestockId) {
                item.addEventListener('click', function(e) {
                    if (e.target.closest('.three-dot-menu')) return;
                    
                    showLivestockDetails(livestockId, notificationId);
                    
                    if (notification && !notification.is_read) {
                        item.classList.remove('unread');
                        item.classList.add('read');
                        notification.is_read = true;
                        
                        const newUnreadCount = allNotifications.filter(n => !n.is_read).length;
                        if (newUnreadCount > 0) {
                            notificationCount.textContent = newUnreadCount;
                        } else {
                            notificationCount.style.display = 'none';
                        }
                    }
                });
            }
        });
        
        document.querySelectorAll('.three-dot-menu').forEach(menu => {
            const notificationId = parseInt(menu.getAttribute('data-id'));
            
            menu.addEventListener('click', function(e) {
                e.stopPropagation();
                
                document.querySelectorAll('.dropdown-menu').forEach(m => {
                    if (m.id !== `menu-${notificationId}`) {
                        m.style.display = 'none';
                    }
                });
                
                const dropdownMenu = document.getElementById(`menu-${notificationId}`);
                dropdownMenu.style.display = dropdownMenu.style.display === 'none' ? 'block' : 'none';
            });
            
            const deleteBtn = menu.querySelector('.delete-notif-btn');
            if (deleteBtn) {
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    deleteNotification(notificationId, e);
                });
            }
        });
        
        document.addEventListener('click', function() {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.style.display = 'none';
            });
        });
    }
    
    if (bell) {
        bell.addEventListener('click', function(e) {
            e.stopPropagation();
            isDropdownOpen = !isDropdownOpen;
            
            if (isDropdownOpen) {
                dropdown.classList.add('show');
                renderNotifications(allNotifications);
            } else {
                dropdown.classList.remove('show');
            }
        });
    }

    document.addEventListener('click', function(e) {
        if (bell && !bell.contains(e.target) && dropdown && !dropdown.contains(e.target)) {
            dropdown.classList.remove('show');
            isDropdownOpen = false;
        }
    });
    
    if (markAllBtn) {
        markAllBtn.addEventListener('click', markAllRead);
    }
    
    fetchNotifications();
    
    setInterval(fetchNotifications, 30000);
});