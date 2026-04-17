from django.urls import path
from . import views

urlpatterns = [
    path('login/', views.custom_login_view, name='login'),
    path('signup/', views.signup, name='signup'),
    path('logout/', views.logout_view, name='logout'),
    path('livestock/', views.livestock_list, name='livestock'),  
]
