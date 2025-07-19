from rest_framework import generics
from .models import Transaction
from .serializers import TransactionSerializer
from django.db.models.functions import Coalesce
from django_filters.rest_framework import DjangoFilterBackend
from .filters import TransactionFilter
from datetime import timedelta
from django.utils.timezone import localtime, now
from django.utils import timezone
from django.db.models import Sum
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import FloatField
class TransactionListCreateView(generics.ListCreateAPIView):
    
    queryset = Transaction.objects.all().order_by('-date','-id')
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransactionFilter

    def perform_create(self, serializer):
        serializer.save(source='manual')

class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

# transactions/views.py


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    user = request.user
    today = localtime(timezone.now()).date()
    print(today.strftime('%A'))
    start_of_month = today.replace(day=1)
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    # Monthly income and expenses
    income_total = Transaction.objects.filter(user=user, type='income', date__gte=start_of_month).aggregate(total=Sum('amount'))['total'] or 0
    expense_total = Transaction.objects.filter(user=user, type='expense', date__gte=start_of_month).aggregate(total=Sum('amount'))['total'] or 0
    expense_total = -expense_total  
    current_balance = income_total - expense_total

    # Weekly analytics
    weekly_data = []
    for day in last_7_days:
        day_total = Transaction.objects.filter(user=user, date=day, type='expense').aggregate(total=Sum('amount'))['total'] or 0
        day_total = -day_total 
        weekly_data.append({
            'date': day.strftime('%b %d'),
            'amount': round(day_total, 2)
        })

    # Group transactions by date
    transactions_by_day = {}
    transactions = Transaction.objects.filter(user=user).order_by('-date')
    for tx in transactions:
        local_date = tx.date
        key = local_date.strftime('%B %d, %A')
        if key not in transactions_by_day:
            transactions_by_day[key] = []
        transactions_by_day[key].append({
            'id': tx.id,
            'amount': tx.amount,
            'category': tx.category,
            'type': tx.type,
            'merchant': tx.merchant,
        })
    print(user.username)
    monthly_expenses_by_category = (
    Transaction.objects
    .filter(user=user, type='expense', date__gte=start_of_month)
    .values('category')
    .annotate(total=Coalesce(Sum('amount', output_field=FloatField()), 0.0))
)

    monthly_expense_chart = [
    {"category": item["category"], "amount": float(abs(item["total"]))}
    for item in monthly_expenses_by_category]
    
    return Response({
        "username": user.username,
        'current_balance': round(current_balance, 2),
        'monthly_income': round(income_total, 2),
        'monthly_expense': round(expense_total, 2),
        'weekly_analytics': weekly_data,
        'transactions_by_day': transactions_by_day,
        'monthly_expense_chart': monthly_expense_chart,
    })
