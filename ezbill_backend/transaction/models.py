from django.db import models
from django.contrib.auth.models import User
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()

def get_default_user():
    try:
        return User.objects.first()
    except:
        return None

class Transaction(models.Model):
    TRANSACTION_TYPES = (
        ('income', 'Income'),
        ('expense', 'Expense'),
    )
    user = models.ForeignKey(User, default=get_default_user, on_delete=models.CASCADE)
    amount = models.FloatField()
    date = models.DateField(auto_now_add=True)
    category = models.CharField(max_length=100, blank=True, null=True, default='Default')
    merchant = models.CharField(max_length=100, blank=True, null=True)
    source = models.CharField(max_length=10, default='manual')  # receipt/manual
    type = models.CharField(max_length=10, choices=TRANSACTION_TYPES, default='Default')
    
class Tag(models.Model):
    name = models.CharField(max_length=50)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tags')

    class Meta:
        unique_together = ('name', 'user')

    def __str__(self):
        return self.name