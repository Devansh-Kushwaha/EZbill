from django.urls import path
from .views import dashboard_summary,TransactionListCreateView, TransactionDetailView, income_vs_expense_over_time
 

urlpatterns = [
    # URL: /api/transactions/
    path('', TransactionListCreateView.as_view(), name='transaction-list-create'),
    
    # URL: /api/transactions/<int:pk>/
    path('<int:pk>/', TransactionDetailView.as_view(), name='transaction-detail'),
    
    # URL: /api/transactions/dashboard/
    path("dashboard/", dashboard_summary, name="dashboard-summary"),
    
    # URL: /api/transactions/income-vs-expense/
    path('income-vs-expense/', income_vs_expense_over_time),
]
