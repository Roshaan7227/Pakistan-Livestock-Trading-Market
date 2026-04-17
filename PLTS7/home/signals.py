from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Favorite, Notification

@receiver(post_save, sender=Favorite)
def create_favorite_notification(sender, instance, created, **kwargs):
    if created:
      
        if instance.user == instance.livestock.user:
            return
            

        Notification.objects.create(
            recipient=instance.livestock.user,
            sender=instance.user,
            livestock=instance.livestock,
            notification_type='favorite',
            message=f"{instance.user.username} has favorited your {instance.livestock.breed} ({instance.livestock.get_species_display()})"
        )
