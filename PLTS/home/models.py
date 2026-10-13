from django.conf import settings
from django.db import models

class Livestock(models.Model):
    SPECIES_CHOICES = [
        ('buffalo', 'Buffalo'),
        ('cow', 'Cow'),
        ('goat', 'Goat'),
        ('sheep', 'Sheep'),
        ('ox', 'Ox'),
        ('chicken', 'Chicken'),
        ('home pets', 'Home Pets'),
        ('parrot', 'Parrot'),
        ('dog', 'Dog'),
        ('cat', 'Cat'),
        ('pigeon', 'Pigeon'),
        ('rabbit', 'Rabbit'),
    ]

    HEALTH_STATUS_CHOICES = [
        ('Healthy', 'Healthy'),
        ('Good', 'Good'),
        ('Critical', 'Critical'),
    ]
    
    AVAILABILITY_STATUS_CHOICES = [
        ('available', 'Available'),
        ('sold', 'Sold'),
    ]
    
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='livestock')
    species = models.CharField(max_length=20, choices=SPECIES_CHOICES)
    breed = models.CharField(max_length=100)
    image = models.ImageField(upload_to='livestock_images/')
    age = models.PositiveIntegerField(blank=True, null=True)
    weight = models.FloatField(blank=True, null=True)
    health = models.CharField(max_length=20, choices=HEALTH_STATUS_CHOICES, blank=True, null=True)
    location = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    phone = models.CharField(max_length=14, blank=True, null=True)
    owner_name = models.CharField(max_length=100, blank=True, null=True)
    availability_status = models.CharField(max_length=20, default='available')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_formatted_age(self):
        """
        Format age in months to human readable format like '2 years 3 months' or '18 months'
        """
        if self.age is None:
            return "N/A"
        
        total_months = int(self.age)
        years = total_months // 12
        months = total_months % 12
        
        if years > 0 and months > 0:
            return f"{years} year{'s' if years != 1 else ''} {months} month{'s' if months != 1 else ''}"
        elif years > 0:
            return f"{years} year{'s' if years != 1 else ''}"
        elif months > 0:
            return f"{months} month{'s' if months != 1 else ''}"
        else:
            return "0 months"
    
    def __str__(self):
        return f"{self.breed} ({self.species}) - {self.location}"


class LivestockGallery(models.Model):
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE, related_name='gallery_photos')
    image = models.ImageField(upload_to='livestock_gallery/')


class Contact(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=13)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.email}"


class Favorite(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    livestock = models.ForeignKey(Livestock, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'livestock')

    def __str__(self):
        return f"{self.user.username} - {self.livestock.breed}"
