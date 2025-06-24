from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView
from core.views import (
    api_home, register_user, get_profile, get_employees,
    TaskViewSet, TeamViewSet, JoinRequestViewSet, RemoveRequestViewSet
)
from django.conf import settings
from django.conf.urls.static import static
from core.views import secure_login
from rest_framework_simplejwt.views import TokenRefreshView


# 🔄 Router pentru viewset-uri (CRUD)
router = DefaultRouter()
router.register(r'tasks', TaskViewSet, basename='tasks')
router.register(r'teams', TeamViewSet, basename='teams')
router.register(r'join-requests', JoinRequestViewSet, basename='join-requests')
router.register(r'remove-requests', RemoveRequestViewSet, basename='remove-requests')

urlpatterns = [
    path('admin/', admin.site.urls),

    #  Endpoint de test: http://localhost:8000/
    path('', api_home),

    #  Înregistrare user: /api/register/
    path('api/register/', register_user),

    #  Profilul userului curent: /api/profile/
    path('api/profile/', get_profile),

    # Lista angajaților (pentru manageri/admini): /api/employees/
    path('api/employees/', get_employees),

    # Include toate rutele de tip viewset: /api/tasks/, /api/teams/, etc
    path('api/', include(router.urls)),
    
    path('api-auth/', include('rest_framework.urls')),  
        
    path('api/login/', secure_login, name='secure_login'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api/', include('core.urls')),

]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
