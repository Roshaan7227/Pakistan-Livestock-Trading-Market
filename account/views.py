from django.shortcuts import render, redirect
from django.contrib.auth.forms import AuthenticationForm
from django.contrib import messages
from django.contrib.auth import logout, login as auth_login, authenticate
from django.contrib.auth.models import User

def login_view(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')

        print(f"Login attempt: {username} / {password}")

        user = authenticate(request, username=username, password=password)

        if user is not None:
            auth_login(request, user)

            next_url = request.POST.get('next') or request.GET.get('next') or 'home'

            if user.is_superuser:
                return redirect('/admin/')
            else:
                return redirect(next_url)

        else:
            messages.error(request, 'Invalid username or password.')
            return render(request, 'login.html')

    return render(request, 'login.html')

def custom_login_view(request):
    if request.method == 'POST':
        form = AuthenticationForm(request, data=request.POST)
        if form.is_valid():
            user = form.get_user()
            auth_login(request, user)
            next_url = request.POST.get('next') or request.GET.get('next') or 'home'
            if user.is_superuser:
                return redirect('/admin/')
            else:
                return redirect(next_url)
    else:
        form = AuthenticationForm()
    return render(request, 'login.html', {'form': form})

def logout_view(request):
    logout(request)
    return redirect('home')

def signup(request):
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        password = request.POST.get('password')
        confirm_password = request.POST.get('confirmPassword')
        phone_number = request.POST.get('phone_number', '')

        if password != confirm_password:
            messages.error(request, 'Passwords do not match.')
            return render(request, 'signup.html')

        if User.objects.filter(username=username).exists():
            messages.error(request, 'Username already exists.')
            return render(request, 'signup.html')

        if User.objects.filter(email=email).exists():
            messages.error(request, 'Email already exists.')
            return render(request, 'signup.html')

        user = User.objects.create_user(username=username, email=email, password=password)
        
        messages.success(request, 'Account created successfully!')
        return redirect('login')
    return render(request, 'signup.html')

def livestock_list(request):
    return render(request, 'livestocklis.html')
