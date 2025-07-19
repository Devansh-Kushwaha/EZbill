from django.db import models
from django.contrib.auth.models import User
class Receipt(models.Model):
    receipt_id = models.AutoField(primary_key=True)
    # user_id = models.IntegerField(User, on_delete=models.CASCADE, null=True, blank=True)
    file = models.FileField(upload_to='receipts/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
