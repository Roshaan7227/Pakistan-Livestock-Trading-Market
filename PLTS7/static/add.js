function formatAgeInput() {
    const ageInput = document.getElementById('age');
    if (!ageInput) return;
    
    ageInput.addEventListener('focus', function() {
        const originalPlaceholder = this.getAttribute('placeholder');
        this.setAttribute('data-original-placeholder', originalPlaceholder);
        this.placeholder = 'Examples: 2 years, 18 months, 2.5 years, 1 year 6 months';
    });
    
    ageInput.addEventListener('blur', function() {
        const originalPlaceholder = this.getAttribute('data-original-placeholder');
        this.placeholder = originalPlaceholder || 'Enter age (e.g., 2 years, 18 months, 2.5 years, etc.)';
    });
 
    ageInput.addEventListener('input', function() {
        const value = this.value.toLowerCase();
        const hasValidPattern = /\d/.test(value) && (value.includes('year') || value.includes('month'));        
        const hasOnlyNumber = /^\d+$/.test(value.replace(/\s/g, ''));        
        const isValid = hasValidPattern || hasOnlyNumber;
        
        if (isValid) {
            this.style.borderColor = '#2E5A3F';
        } else {
            this.style.borderColor = '#e1e1e1';
        }
    });
}


document.addEventListener('DOMContentLoaded', function() {
    formatAgeInput();
    
    const animalTypeSelect = document.getElementById('animal_type');
    const petTypeContainer = document.getElementById('pet_type_container');
    const petTypeSelect = document.getElementById('pet_type');
    
    if (animalTypeSelect && petTypeContainer && petTypeSelect) {
        animalTypeSelect.addEventListener('change', function() {
            if (this.value === 'home pets') {
                petTypeContainer.style.display = 'block';
                petTypeSelect.required = true;
            } else {
                petTypeContainer.style.display = 'none';
                petTypeSelect.required = false;
                petTypeSelect.value = '';
            }
        });
        
        if (animalTypeSelect.value === 'home pets') {
            petTypeContainer.style.display = 'block';
            petTypeSelect.required = true;
        }
    }
    const imageInput = document.getElementById('image');
    const imageNameSpan = document.querySelector('#image + .file-label + .file-name');
    
    if(imageInput && imageNameSpan) {
        imageInput.addEventListener('change', function() {
            if(this.files && this.files.length > 0) {
                const fileName = this.files[0].name;
                imageNameSpan.textContent = fileName;
            } else {
                imageNameSpan.textContent = 'No file chosen';
            }
        });
    }
    
    const additionalImagesInput = document.getElementById('additional_images');
    const additionalImagesNameSpan = document.querySelector('#additional_images + .file-label + .file-name');
    
    if(additionalImagesInput && additionalImagesNameSpan) {
        additionalImagesInput.addEventListener('change', function() {
            if(this.files && this.files.length > 0) {
                if(this.files.length === 1) {
                    additionalImagesNameSpan.textContent = this.files[0].name;
                } else {
                    additionalImagesNameSpan.textContent = `${this.files.length} files selected`;
                }
               
            } else {
                additionalImagesNameSpan.textContent = 'No files chosen';
            }
        });
    }
    
    const form = document.querySelector('.add-livestock-form');
    if(form) {
        form.addEventListener('submit', function(e) {
            const mainImage = document.getElementById('image').files.length;
            const additionalImages = document.getElementById('additional_images').files.length;
            
            if(mainImage === 0 && additionalImages === 0) {
                e.preventDefault();
                alert('Please select at least one image for your livestock.');
                return false;
            }
        });
    }
});