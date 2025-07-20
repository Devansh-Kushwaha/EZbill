from django.urls import path
from .views import UploadReceiptView

urlpatterns = [
    path('upload/', UploadReceiptView.as_view(), name='upload_receipt'), # Use this route for uploading receipts for OCR processing
]
