from django.urls import path
from .views import RegisterView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import (
    TokenRefreshView,
    TokenVerifyView
)

urlpatterns = [
    # POST /register/ → Calls the RegisterView to create a new user
    path('register/', RegisterView.as_view(), name='register'),
    
    # POST /login/ → Returns a pair of tokens (access + refresh) for valid credentials
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # POST /refresh/ → Takes a refresh token and returns a new access token
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # POST /verify/ → Verifies if a given token is valid
    path('verify/', TokenVerifyView.as_view(), name='token_verify'),
]
