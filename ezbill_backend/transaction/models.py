from django.db import models
# from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def get_default_user():
    try:
        return User.objects.first() # Return the first user if available for development testing
    except:
        return None

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    user = models.ForeignKey(User, default=get_default_user, on_delete=models.CASCADE) #cascade to remove transactions if user is deleted
    amount = models.FloatField()
    date = models.DateField(null=True, blank=True)
    time = models.TimeField(null=True, blank=True)
    category = models.CharField(max_length=100, blank=True, null=True, default='Default')
    merchant = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=10, default='manual')  # receipt/manual
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='expense')
    
