from rest_framework.views import APIView
from rest_framework.response import Response
# from .models import Receipt
from transaction.models import Transaction
from .extractor import extract_amount
import cv2
from datetime import datetime
from django.core.files.storage import default_storage
import pdfplumber
import pytesseract

class UploadReceiptView(APIView):
    def post(self, request):
        file = request.FILES['file']
        path = default_storage.save(f"receipts/{file.name}", file)
        full_path = default_storage.path(path)

        text=""
        
        if len(file.name) >= 4 and file.name[-4:].lower()==('.pdf'):
            try:
                with pdfplumber.open(full_path) as pdf:
                    for page in pdf.pages:
                        text += page.extract_text() + "\n"
            except Exception as e:
                return Response({"error": f"Error reading PDF: {str(e)}"}, status=400)
        
        else: 
            image = cv2.imread(full_path)
            if image is None:
                return Response({"error": "Invalid image"}, status=400)

            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            text = pytesseract.image_to_string(gray)

            if not text.strip():
                return Response({"error": "No text could be extracted from the file"}, status=422)
            amount = extract_amount(text)
            if amount is None:
                return Response({"error": "Could not extract amount"}, status=422)

        return Response({
            "message": "Transaction created",
            "amount": amount,
            "raw_text": text
        })
