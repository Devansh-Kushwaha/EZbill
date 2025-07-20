from rest_framework.views import APIView
from rest_framework.response import Response
from django.core.files.storage import default_storage
from .extractor import extract_amount

import pdfplumber
import pytesseract
import cv2

class UploadReceiptView(APIView):
    def post(self, request):
        file = request.FILES.get('file')

        if not file:
            return Response({"error": "No file provided"}, status=400)

        # Save file temporarily
        path = default_storage.save(f"receipts/{file.name}", file)
        full_path = default_storage.path(path)

        text = "" # Initialize text variable to store extracted text

        try:
            # Check if the file is a PDF or an image
            if len(file.name) >= 4 and file.name[-4:].lower()==('.pdf'):
                with pdfplumber.open(full_path) as pdf:
                    for page in pdf.pages:
                        page_text = page.extract_text()
                        if page_text:
                            text += page_text + "\n"
            else:
                # Assume it's an image file
                # Use OpenCV and Tesseract for image processing
                image = cv2.imread(full_path)
                if image is None:
                    return Response({"error": "Invalid image"}, status=400)

                gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
                text = pytesseract.image_to_string(gray)
                
        #If any error occurs during processing
        except Exception as e:
            return Response({"error": f"Error while processing the file: {str(e)}"}, status=500)
        
        #If no readable text was available
        if not text.strip():
            return Response({"error": "No text could be extracted from the file"}, status=422)

        #Uses /receipt/extractor.py to extract amount from the text
        amount = extract_amount(text)
        
        if amount is None:
            return Response({"error": "We could not extract any amount"}, status=422)

        return Response({
            "message": "Receipt processed",
            "amount": amount,
            "raw_text": text
        })
