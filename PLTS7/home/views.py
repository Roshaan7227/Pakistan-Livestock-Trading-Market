import re
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.http import HttpResponseForbidden, JsonResponse
from django.conf import settings
from django.db import models 
from django.core.mail import send_mail
from .models import Contact, Livestock, LivestockGallery, Favorite, Notification
from django.contrib import messages

@login_required
def get_livestock_details(request, livestock_id):
    livestock = get_object_or_404(Livestock, id=livestock_id)
    data = {
        'id': livestock.id,
        'species': livestock.get_species_display(),
        'breed': livestock.breed,
        'age': livestock.get_formatted_age(),
        'weight': livestock.weight,
        'health': livestock.health,
        'location': livestock.location,
        'price': str(livestock.price),
        'availability_status': livestock.availability_status,
        'image_url': livestock.image.url if livestock.image else None,
        'owner_name': livestock.owner_name,
        'phone': livestock.phone,
    }
    return JsonResponse(data)

def home_view(request):
    locations = Livestock.objects.filter(availability_status='available').values_list('location', flat=True).distinct().order_by('location')
    
    featured_livestock = Livestock.objects.filter(availability_status='available')[:6]
    
    context = {
        'locations': locations,
        'species_choices': Livestock.SPECIES_CHOICES,
        'featured_livestock': featured_livestock,
    }
    return render(request, 'home.html', context)


def search_livestock(request):
    query = request.GET.get('q', '') 
    location = request.GET.get('location', '')
    species = request.GET.get('species', '')
    min_price = request.GET.get('min_price', '')
    max_price = request.GET.get('max_price', '')
    
    livestock_list = Livestock.objects.filter(availability_status='available')
    
    if query:
        livestock_list = livestock_list.filter(
            models.Q(breed__icontains=query) |
            models.Q(description__icontains=query) |
            models.Q(location__icontains=query)
        )
    
    if location:
        livestock_list = livestock_list.filter(location__icontains=location)
    
    if species:
        livestock_list = livestock_list.filter(species=species)
    
    if min_price != '':
        try:
            min_price = float(min_price)
            livestock_list = livestock_list.filter(price__gte=min_price)
        except ValueError:
            pass
    
    if max_price != '':
        try:
            max_price = float(max_price)
            livestock_list = livestock_list.filter(price__lte=max_price)
        except ValueError:
            pass
    
    all_locations = Livestock.objects.filter(availability_status='available').values_list('location', flat=True).distinct().order_by('location')
    
    context = {
        'livestock_list': livestock_list,
        'query': query,
        'location_filter': location,
        'species_filter': species,
        'min_price': min_price,
        'max_price': max_price,
        'locations': all_locations,
        'species_choices': Livestock.SPECIES_CHOICES,
        'total_results': livestock_list.count(),
    }
    
    return render(request, 'search_results.html', context)

def livestock_list_view(request):
    livestock_data = Livestock.objects.all()
    return render(request, 'livestocklis.html', {'livestock_data': livestock_data})
 
def viewdetails_view(request, livestock_id):
    livestock = get_object_or_404(Livestock, id=livestock_id)
    is_favorited = False
    if request.user.is_authenticated:
        is_favorited = Favorite.objects.filter(user=request.user, livestock=livestock).exists()
    return render(request, 'viewdetails.html', {
        'livestock': livestock,
        'is_favorited': is_favorited
    })

def blog_view(request):
    return render(request, 'blog.html')

def ten_things_view(request):
    return render(request, '10things.html')

def health_guide_view(request):
    return render(request, 'health_guide.html')

def market_trends_view(request):
    return render(request, 'market_trends.html')

def digital_trading_view(request):
    return render(request, 'digital_trading.html')

def farmer_story_view(request):
    return render(request, 'farmer_story.html')

def qurbani_guide_view(request):
    return render(request, 'qurbani_guide.html')

def livestock_type(request, species):
    if species == 'home pets':
        livestock_data = Livestock.objects.filter(species__in=['parrot', 'dog', 'cat', 'pigeon', 'rabbit', 'horse'])
    else:
        livestock_data = Livestock.objects.filter(species=species)
    template_map = {
        'cow': 'cowlis.html',
        'goat': 'goatlis.html',
        'sheep': 'sheeplis.html',
        'buffalo': 'buffalolis.html',
        'chicken': 'henlis.html',
        'ox': 'oxlis.html',
        'home pets': 'homepets.html'
    }
    template_name = template_map.get(species.lower(), 'livestocklis.html')
    return render(request, template_name, {'livestock_data': livestock_data, 'species': species})


@login_required(login_url='/accounts/login/')
def update_livestock_status(request, pk):
    livestock_obj = get_object_or_404(Livestock, pk=pk)
    if livestock_obj.user != request.user:
        return HttpResponseForbidden('You are not allowed to update this livestock.')

    context = {
        'livestock': livestock_obj,
        'health_choices': Livestock.HEALTH_STATUS_CHOICES,
        'availability_choices': Livestock.AVAILABILITY_STATUS_CHOICES
    }
    
    if request.method == 'POST':
        health_status = request.POST.get('health_status')
        availability_status = request.POST.get('availability_status')
        age = request.POST.get('age')
        weight = request.POST.get('weight')
        location = request.POST.get('location')
        
        updated = False
        
        if health_status and health_status in dict(Livestock.HEALTH_STATUS_CHOICES):
            livestock_obj.health = health_status
            updated = True
    
        if availability_status and availability_status in dict(Livestock.AVAILABILITY_STATUS_CHOICES):
            livestock_obj.availability_status = availability_status
            updated = True
        
        if age:
            try:
                age_value = int(age)
                if age_value < 0:
                    messages.error(request, 'Value should be positive.')
                    return render(request, 'updatestatus.html', context)
                livestock_obj.age = age_value
                updated = True
            except ValueError:
                messages.error(request, 'Please enter a valid age in months.')
                return render(request, 'updatestatus.html', context)
        
        if weight:
            try:
                livestock_obj.weight = float(weight)
                updated = True
            except ValueError:
                pass
        
        if location:
            livestock_obj.location = location
            updated = True
        
        if updated:
            livestock_obj.save()
            messages.success(request, 'Livestock details updated successfully!')
            return redirect('viewdetails', livestock_id=livestock_obj.id)
        else:
            messages.warning(request, 'No changes were made.')
        
    return render(request, 'updatestatus.html', context)

@login_required(login_url='/accounts/login/')
def deletelivestock(request, pk):
    livestock_obj = get_object_or_404(Livestock, pk=pk)
    if livestock_obj.user != request.user:
        return HttpResponseForbidden('You are not allowed to delete this livestock.')
    if request.method == 'POST':
        livestock_obj.delete()
        
        home_pet_species = ['parrot', 'dog', 'cat', 'pigeon', 'rabbit', 'horse']
        
        if livestock_obj.species in home_pet_species:
            return redirect('homepetslis', species='home pets')
        elif livestock_obj.species in ['cow', 'goat', 'sheep', 'buffalo', 'chicken', 'ox']:
            url_mapping = {
                'cow': 'cowlis',
                'goat': 'goatlis',
                'sheep': 'sheeplis',
                'buffalo': 'buffalolis',
                'chicken': 'henlis',
                'ox': 'oxlis'
            }
            url_pattern = url_mapping.get(livestock_obj.species)
            return redirect(url_pattern, species=livestock_obj.species)
        else:
            return redirect('livestock')
    return render(request, 'deletelivestock.html', {'livestock': livestock_obj})



def parse_age(age_str):
    if not age_str:
        return None
    
    age_str = age_str.lower().strip()
    
    years_match = re.search(r'([+-]?\d+(?:\.\d+)?)\s*(?:year|years)', age_str)
    months_match = re.search(r'([+-]?\d+(?:\.\d+)?)\s*(?:month|months)', age_str)
    
    total_months = 0.0
    
    if years_match:
        years = float(years_match.group(1))
        if years < 0:
            return None
        total_months += years * 12
    
    if months_match:
        months = float(months_match.group(1))
        if months < 0:
            return None
        total_months += months
    
    if not years_match and not months_match:
        numeric_match = re.search(r'([+-]?\d+(?:\.\d+)?)', age_str)
        if not numeric_match:
            return None
        num = float(numeric_match.group(1))
        if num < 0:
            return None
        total_months = num * 12
    
    return int(total_months)


@login_required(login_url='/accounts/login/')
def add_livestock(request):
    if request.method == 'POST':
        breed = request.POST.get('breed')
        species = request.POST.get('animal_type')
        pet_type = request.POST.get('pet_type')
        image = request.FILES.get('image')
        age_input = request.POST.get('age')
        age = parse_age(age_input)
        weight = request.POST.get('weight')
        health = request.POST.get('health_status')  
        location = request.POST.get('location')
        description = request.POST.get('description', '')
        gender = request.POST.get('gender')
        price = request.POST.get('price')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        owner_name = request.POST.get('owner_name')
        
        if species == 'home pets' and pet_type:
            species = pet_type

        if age_input and age is None:
            if re.search(r'-\s*\d', age_input):
                messages.error(request, 'Value should be positive.')
            else:
                messages.error(request, 'Please enter a valid age.')
            return render(request, 'addlive.html')

        if price:
            try:
                price_value = float(price)
                if price_value <= 0:
                    messages.error(request, 'Price should be positive.')
                    return render(request, 'addlive.html')
            except ValueError:
                messages.error(request, 'Please enter a valid price.')
                return render(request, 'addlive.html')
        else:
            messages.error(request, 'Price is required.')
            return render(request, 'addlive.html')

        # Validate weight is positive
        if weight:
            try:
                weight_value = float(weight)
                if weight_value <= 0:
                    messages.error(request, 'Weight should be positive.')
                    return render(request, 'addlive.html')
            except ValueError:
                messages.error(request, 'Please enter a valid weight.')
                return render(request, 'addlive.html')
        else:
            messages.error(request, 'Weight is required.')
            return render(request, 'addlive.html')

        if not breed or not species or not image or not health or not location or not phone:
            messages.error(request, 'Please fill in all required fields including Phone Number.')
            return render(request, 'addlive.html')

        livestock = Livestock.objects.create(
            user=request.user,
            species=species,
            breed=breed,
            image=image,
            age=age,
            weight=weight,
            health=health,
            location=location,
            description=description,
            price=price,
            phone=phone,
            owner_name=owner_name,
            availability_status='available' 
        )

        gallery_images = request.FILES.getlist('additional_images')
        for photo in gallery_images:
            LivestockGallery.objects.create(livestock=livestock, image=photo)
        
        url_mapping = {
            'cow': 'cowlis',
            'goat': 'goatlis',
            'sheep': 'sheeplis',
            'buffalo': 'buffalolis',
            'chicken': 'henlis',
            'ox': 'oxlis',
            'home pets': 'homepetslis',
            'parrot': 'homepetslis',
            'dog': 'homepetslis',
            'cat': 'homepetslis',
            'pigeon': 'homepetslis',
            'rabbit': 'homepetslis'
        }
        
        url_pattern = url_mapping.get(species, 'livestock')
        return redirect(url_pattern, species=species)

    return render(request, 'addlive.html')


@login_required
def contact_view(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        phone = request.POST.get('phone')
        message = request.POST.get('message')
        Contact.objects.create(
            user=request.user,
            name=name,
            email=email,
            phone=phone,
            message=message
        )
        try:
            send_mail(
                subject=f'New Contact from {name}',
                message=f'Name: {name}\nEmail: {email}\nPhone: {phone}\nMessage: {message}\nUser: {request.user.username}',
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[settings.EMAIL_HOST_USER],  
                fail_silently=False,
            )
            messages.success(request, 'Your message has been sent successfully!')
        except Exception as e:
            messages.error(request, 'Message saved but email failed to send.')
        return render(request, 'contact.html')
    return render(request, 'contact.html')


@login_required
def toggle_favorite(request, livestock_id):
    if request.method == 'POST':
        livestock = get_object_or_404(Livestock, id=livestock_id)
        
        favorite_exists = Favorite.objects.filter(user=request.user, livestock=livestock).exists()
        
        if favorite_exists:
            Favorite.objects.filter(user=request.user, livestock=livestock).delete()
            return JsonResponse({'status': 'removed', 'message': 'Removed from favorites'})
        else:
            Favorite.objects.create(user=request.user, livestock=livestock)
            return JsonResponse({'status': 'added', 'message': 'Added to favorites'})
    
    return JsonResponse({'error': 'Invalid request method'}, status=400)


@login_required
def favorite_list(request):
    favorites = Favorite.objects.filter(user=request.user).select_related('livestock')
    return render(request, 'favorites.html', {'favorites': favorites})


def favorites_count(request):
    if request.user.is_authenticated:
        count = Favorite.objects.filter(user=request.user).count()
    else:
        count = 0
    return JsonResponse({'count': count})


@login_required
def get_notifications(request):
    notifications = Notification.objects.filter(recipient=request.user).order_by('-created_at')
    unread_count = Notification.objects.filter(recipient=request.user, is_read=False).count()
    
    return JsonResponse({
        'count': unread_count,
        'notifications': [
            {
                'id': n.id,
                'message': n.message,
                'type': n.notification_type,
                'created_at': n.created_at.strftime("%Y-%m-%d %H:%M"),
                'livestock_id': n.livestock.id if n.livestock else None,
                'is_read': n.is_read,
            } for n in notifications
        ]
    })

@login_required
def delete_notification(request, notification_id):
    if request.method == 'DELETE':
        notification = get_object_or_404(Notification, id=notification_id, recipient=request.user)
        notification.delete()
        return JsonResponse({'status': 'success'})
    return JsonResponse({'error': 'Invalid method'}, status=400)

@login_required
def mark_notification_read(request, notification_id):
    notification = Notification.objects.get(id=notification_id, recipient=request.user)
    notification.is_read = True
    notification.save()
    return JsonResponse({'status': 'success'})

@login_required
def mark_all_notifications_read(request):
    Notification.objects.filter(recipient=request.user, is_read=False).update(is_read=True)
    return JsonResponse({'status': 'success'})
