from django.db import models

# Model to store uploaded receipt files
class Receipt(models.Model):
    receipt_id = models.AutoField(primary_key=True)
    file = models.FileField(upload_to='receipts/')
    uploaded_at = models.DateTimeField(auto_now_add=True)
