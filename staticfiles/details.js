document.addEventListener('DOMContentLoaded', function() {
    var galleryImages = [];
    var currentImageIndex = 0;
    var modal = document.getElementById('imageModal');
    var modalImg = document.getElementById('modalImg');
    var modalPrev = document.getElementById('modalPrev');
    var modalNext = document.getElementById('modalNext');
    var closeBtn = document.querySelector('.modal-close');

    var galleryThumbs = document.querySelectorAll('.gallery-thumb');
    for (var i = 0; i < galleryThumbs.length; i++) {
        (function(index) {
            var thumb = galleryThumbs[index];
            var imgUrl = thumb.getAttribute('data-img-url');
            if (imgUrl) {
                galleryImages.push(imgUrl);
                thumb.addEventListener('click', function() {
                    currentImageIndex = index;
                    openImageModal(currentImageIndex);
                });
            }
        })(i);
    }

    function openImageModal(index) {
        if (modal && modalImg && galleryImages.length > 0) {
            modalImg.src = galleryImages[index];
            modal.style.display = 'flex';
            updateNavButtons();
        }
    }

    function closeImageModal() {
        if (modal) {
            modal.style.display = 'none';
        }
    }

    function showPrevImage() {
        if (galleryImages.length > 0) {
            currentImageIndex = (currentImageIndex - 1 + galleryImages.length) % galleryImages.length;
            modalImg.src = galleryImages[currentImageIndex];
            updateNavButtons();
        }
    }

    function showNextImage() {
        if (galleryImages.length > 0) {
            currentImageIndex = (currentImageIndex + 1) % galleryImages.length;
            modalImg.src = galleryImages[currentImageIndex];
            updateNavButtons();
        }
    }

    function updateNavButtons() {
        if (modalPrev && modalNext) {
            if (galleryImages.length <= 1) {
                modalPrev.style.display = 'none';
                modalNext.style.display = 'none';
            } else {
                modalPrev.style.display = 'flex';
                modalNext.style.display = 'flex';
            }
        }
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', closeImageModal);
    }

    if (modalPrev) {
        modalPrev.addEventListener('click', showPrevImage);
    }

    if (modalNext) {
        modalNext.addEventListener('click', showNextImage);
    }

    window.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeImageModal();
        }
    });

    document.addEventListener('keydown', function(e) {
        if (modal && modal.style.display === 'flex') {
            if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            } else if (e.key === 'Escape') {
                closeImageModal();
            }
        }
    });

    var favBtn = document.getElementById('favBtn');
    if (favBtn) {
        favBtn.addEventListener('click', function(e) {
            e.preventDefault();
            var id = this.getAttribute('data-id');
            var self = this;

            function getCookie(name) {
                var val = null;
                if (document.cookie && document.cookie !== '') {
                    var arr = document.cookie.split(';');
                    for (var i = 0; i < arr.length; i++) {
                        var c = arr[i].trim();
                        if (c.substring(0, name.length + 1) === (name + '=')) {
                            val = decodeURIComponent(c.substring(name.length + 1));
                            break;
                        }
                    }
                }
                return val;
            }

            var token = getCookie('csrftoken');

            self.disabled = true;
            self.style.opacity = '0.6';

            fetch('/toggle-favorite/' + id + '/', {
                method: 'POST',
                headers: {
                    'X-CSRFToken': token,
                    'Content-Type': 'application/json'
                },
                credentials: 'same-origin'
            })
            .then(function(res) { return res.json(); })
            .then(function(data) {
                var txt = document.getElementById('favText');
                if (data.status === "removed") {
                    self.classList.remove('active');
                    if (txt) txt.textContent = 'Add to Favorites';
                    showToast('Removed from favorites', 'removed');
                } else if (data.status === "added") {
                    self.classList.add('active');
                    if (txt) txt.textContent = 'Remove from Favorites';
                    showToast('Added to favorites', 'added');
                }
            })
            .catch(function() {
                showToast('Something went wrong', 'error');
            })
            .finally(function() {
                self.disabled = false;
                self.style.opacity = '1';
            });
        });
    }

    function showToast(msg, type) {
        var el = document.createElement('div');
        el.className = 'toast-message';
        el.innerHTML = '<i class="fas fa-heart"></i> ' + msg;
        var color = '#28a745';
        if (type === 'error' || type === 'removed') color = '#dc3545';
        el.style.cssText = 'position:fixed;bottom:20px;right:20px;background:' + color + ';color:#fff;padding:12px 20px;border-radius:8px;z-index:9999;font-weight:500;box-shadow:0 4px 12px rgba(0,0,0,0.15);animation:slideInRight 0.3s ease,fadeOut 0.3s ease 1.7s forwards;';
        document.body.appendChild(el);
        if (!document.getElementById('toast-style')) {
            var s = document.createElement('style');
            s.id = 'toast-style';
            s.innerHTML = '@keyframes slideInRight{from{transform:translateX(100%);opacity:0;}to{transform:translateX(0);opacity:1;}}@keyframes fadeOut{from{opacity:1;}to{opacity:0;transform:translateX(100%);}}';
            document.head.appendChild(s);
        }
        setTimeout(function() { if (el && el.remove) el.remove(); }, 2000);
    }

    var track = document.querySelector('.carousel-track');
    var slides = document.querySelectorAll('.carousel-slide');
    var prevBtn = document.querySelector('.prev-btn');
    var nextBtn = document.querySelector('.next-btn');
    var indicators = document.querySelectorAll('.indicator');

    if (track && slides.length > 0) {
        var currentIndex = 0;
        var slideCount = slides.length;

        function updateCarouselPosition() {
            if (track) {
                track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
            }
        }

        function updateIndicators() {
            for (var i = 0; i < indicators.length; i++) {
                if (i === currentIndex) {
                    indicators[i].classList.add('active');
                } else {
                    indicators[i].classList.remove('active');
                }
            }
        }

        updateCarouselPosition();
        updateIndicators();

        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                currentIndex = (currentIndex - 1 + slideCount) % slideCount;
                updateCarouselPosition();
                updateIndicators();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                currentIndex = (currentIndex + 1) % slideCount;
                updateCarouselPosition();
                updateIndicators();
            });
        }

        for (var i = 0; i < indicators.length; i++) {
            (function(index) {
                indicators[index].addEventListener('click', function() {
                    currentIndex = index;
                    updateCarouselPosition();
                    updateIndicators();
                });
            })(i);
        }

        var autoAdvance = setInterval(function() {
            currentIndex = (currentIndex + 1) % slideCount;
            updateCarouselPosition();
            updateIndicators();
        }, 5000);

        var carouselContainer = document.querySelector('.carousel-container');
        if (carouselContainer) {
            carouselContainer.addEventListener('mouseenter', function() {
                clearInterval(autoAdvance);
            });
            carouselContainer.addEventListener('mouseleave', function() {
                autoAdvance = setInterval(function() {
                    currentIndex = (currentIndex + 1) % slideCount;
                    updateCarouselPosition();
                    updateIndicators();
                }, 5000);
            });
        }
    }

    var anchors = document.querySelectorAll('a[href^="#"]');
    for (var i = 0; i < anchors.length; i++) {
        anchors[i].addEventListener('click', function(e) {
            e.preventDefault();
            var target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    }

    var observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    var observer = new IntersectionObserver(function(entries) {
        for (var i = 0; i < entries.length; i++) {
            if (entries[i].isIntersecting) {
                entries[i].target.style.opacity = '1';
                entries[i].target.style.transform = 'translateY(0)';
            }
        }
    }, observerOptions);

    var animatedElements = document.querySelectorAll('.detail-item, .description-section, .gallery-section, .contact-item');
    for (var i = 0; i < animatedElements.length; i++) {
        animatedElements[i].style.opacity = '0';
        animatedElements[i].style.transform = 'translateY(20px)';
        animatedElements[i].style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(animatedElements[i]);
    }

    window.addEventListener('resize', function() {
        var trackElement = document.querySelector('.carousel-track');
        if (trackElement) {
            trackElement.style.transform = 'translateX(0)';
        }
    });
});