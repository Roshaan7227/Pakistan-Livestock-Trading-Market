document.addEventListener('DOMContentLoaded', function() {
    initializeImageModal();
});

function initializeImageModal() {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImg');
    const closeBtn = document.querySelector('.modal-close');
    const prevBtn = document.getElementById('modalPrev');
    const nextBtn = document.getElementById('modalNext');
    const mainImage = document.querySelector('.main-image');
    const galleryThumbs = document.querySelectorAll('.gallery-thumb');
    
    let allImages = [];
    let currentImageIndex = 0;
    
    function collectAllImages() {
        allImages = [];
        
        if (mainImage && mainImage.dataset.imgUrl) {
            allImages.push(mainImage.dataset.imgUrl);
        }
        
        galleryThumbs.forEach(thumb => {
            if (thumb.dataset.imgUrl) {
                allImages.push(thumb.dataset.imgUrl);
            }
        });
    }
    
    function openModal(imgUrl) {
        collectAllImages();
        currentImageIndex = allImages.indexOf(imgUrl);
        if (currentImageIndex === -1) {
            currentImageIndex = 0;
        }
        modalImg.src = imgUrl;
        modal.style.display = 'block';
        updateNavButtons();
    }
    
    function closeModal() {
        modal.style.display = 'none';
    }
    
    function updateNavButtons() {
        if (allImages.length <= 1) {
            prevBtn.style.display = 'none';
            nextBtn.style.display = 'none';
        } else {
            prevBtn.style.display = 'block';
            nextBtn.style.display = 'block';
        }
    }
    
    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + allImages.length) % allImages.length;
        modalImg.src = allImages[currentImageIndex];
    }
    
    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % allImages.length;
        modalImg.src = allImages[currentImageIndex];
    }
    
    if (mainImage) {
        mainImage.style.cursor = 'pointer';
        mainImage.addEventListener('click', function() {
            openModal(this.dataset.imgUrl);
        });
    }
    
    galleryThumbs.forEach(thumb => {
        thumb.addEventListener('click', function() {
            openModal(this.dataset.imgUrl);
        });
    });
    
    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }
    
    if (prevBtn) {
        prevBtn.addEventListener('click', showPrevImage);
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', showNextImage);
    }
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeModal();
        }
    });
    
    document.addEventListener('keydown', function(e) {
        if (modal.style.display === 'block') {
            if (e.key === 'Escape') {
                closeModal();
            } else if (e.key === 'ArrowLeft') {
                showPrevImage();
            } else if (e.key === 'ArrowRight') {
                showNextImage();
            }
        }
    });
}
