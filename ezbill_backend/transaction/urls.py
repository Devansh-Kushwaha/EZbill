from django.urls import path
from .views import dashboard_summary,TransactionListCreateView, TransactionDetailView

urlpatterns = [
    path('', TransactionListCreateView.as_view(), name='transaction-list-create'),
    path('<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    path("dashboard/", dashboard_summary, name="dashboard-summary"),
]
