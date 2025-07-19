import django_filters
from .models import Transaction

class TransactionFilter(django_filters.FilterSet):
    date_min = django_filters.DateFilter(field_name="date", lookup_expr='gte')
    date_max = django_filters.DateFilter(field_name="date", lookup_expr='lte')
    amount_min = django_filters.NumberFilter(field_name="amount", lookup_expr='gte')
    amount_max = django_filters.NumberFilter(field_name="amount", lookup_expr='lte')

    class Meta:
        model = Transaction
        fields = ['category', 'source']
