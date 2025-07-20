from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser

from .models import Transaction
from .serializers import TransactionSerializer
from .filters import TransactionFilter

from django_filters.rest_framework import DjangoFilterBackend
from django.db.models.functions import Coalesce
from django.db.models import Sum, FloatField
from django.utils.timezone import localtime
from django.utils import timezone
from datetime import timedelta, date

import fitz 
import ollama
import json
from datetime import datetime
import re


# ---------------------- Transaction CRUD Views ---------------------- #

class TransactionListCreateView(generics.ListCreateAPIView):
    serializer_class = TransactionSerializer
    filter_backends = [DjangoFilterBackend]
    filterset_class = TransactionFilter

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user).order_by('-date', '-id')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, source='manual')


class TransactionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer

# ---------------------- Dashboard Summary ---------------------- #

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    user = request.user
    today = localtime(timezone.now()).date()
    start_of_month = today.replace(day=1)
    last_7_days = [today - timedelta(days=i) for i in range(6, -1, -1)]

    income_total = Transaction.objects.filter(user=user, type='income', date__gte=start_of_month).aggregate(total=Sum('amount'))['total'] or 0
    expense_total = Transaction.objects.filter(user=user, type='expense', date__gte=start_of_month).aggregate(total=Sum('amount'))['total'] or 0
    expense_total = -expense_total
    current_balance = income_total - expense_total

    weekly_data = []
    for day in last_7_days:
        day_total = Transaction.objects.filter(user=user, date=day, type='expense').aggregate(total=Sum('amount'))['total'] or 0
        weekly_data.append({
            'date': day.isoformat(),
            'amount': round(-day_total, 2)
        })

    transactions_by_day = {}
    transactions = Transaction.objects.filter(user=user).order_by('-date')
    for tx in transactions:
        key = tx.date.strftime('%B %d, %A')
        transactions_by_day.setdefault(key, []).append({
            'id': tx.id,
            'amount': tx.amount,
            'category': tx.category,
            'type': tx.type,
            'merchant': tx.merchant,
        })

    monthly_expenses_by_category = (
        Transaction.objects
        .filter(user=user, type='expense', date__gte=start_of_month)
        .values('category')
        .annotate(total=Coalesce(Sum('amount', output_field=FloatField()), 0.0))
    )

    monthly_expense_chart = [
        {"category": item["category"], "amount": float(abs(item["total"]))}
        for item in monthly_expenses_by_category
    ]

    return Response({
        "username": user.username,
        'current_balance': round(current_balance, 2),
        'monthly_income': round(income_total, 2),
        'monthly_expense': round(expense_total, 2),
        'weekly_analytics': weekly_data,
        'transactions_by_day': transactions_by_day,
        'monthly_expense_chart': monthly_expense_chart,
    })

# ---------------------- Income vs Expense Chart ---------------------- #

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def income_vs_expense_over_time(request):
    user = request.user
    today = date.today()
    start_date = today - timedelta(days=29)
    data = []

    for i in range(30):
        day = start_date + timedelta(days=i)
        day_transactions = Transaction.objects.filter(user=user, date=day)
        income = day_transactions.filter(type='income').aggregate(Sum('amount'))['amount__sum'] or 0
        expense = day_transactions.filter(type='expense').aggregate(Sum('amount'))['amount__sum'] or 0

        data.append({
            "date": day.strftime("%Y-%m-%d"),
            "income": income,
            "expense": expense,
        })

    return Response(data)

# ---------------------- PDF Receipt Upload ---------------------- #

class ReceiptUploadView(APIView):
    parser_classes = [MultiPartParser]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        uploaded_file = request.FILES.get("file")
        if not uploaded_file:
            return Response({"error": "No file uploaded"}, status=400)

        # Extract raw text
        text = ""
        try:
            with fitz.open(stream=uploaded_file.read(), filetype="pdf") as doc:
                for page in doc:
                    text += page.get_text()
        except Exception as e:
            return Response({"error": "Failed to read PDF"}, status=500)

        # Use LLM (mistral)
        prompt = f"""This is a receipt-like table:\n{text}\n
Convert each row into a JSON object with keys: merchant, amount, date (dd/mm/yyyy), time.
Return only a JSON array. Do NOT include explanations. remove ```json.```, if present"""  

        try:
            print("Using LLM to parse receipt text...")
            response = ollama.chat(
                model="mistral",
                messages=[{"role": "user", "content": prompt}]
            )

            raw_content = response.get('message', {}).get('content', "").strip()

            json_match = re.search(r"```(?:json)?\s*(\[\s*{.*?}\s*])\s*```", raw_content, re.DOTALL)
            if json_match:
                raw_content = json_match.group(1).strip()
            elif raw_content.startswith("[") and raw_content.endswith("]"):

                pass
            else:
                return Response({"error": "Failed to locate JSON array in LLM output"}, status=500)



            # Parse response
            try:
                parsed_entries = json.loads(raw_content)
            except json.JSONDecodeError:
                parsed_entries = eval(raw_content)

        except Exception as err:
            return Response({"error": "Failed to parse receipt data"}, status=500)

        # Save transactions
        count = 0
        for entry in parsed_entries:
            try:
                Transaction.objects.create(
                    user=request.user,
                    merchant=entry.get("merchant") or entry.get("note"),
                    amount=-float(str(entry["amount"]).replace(",", "")),
                    date=datetime.strptime(entry["date"], "%d/%m/%Y").date(),
                    time=entry["time"],
                    type="expense",
                    source="extracted"
                )
                count += 1
            except Exception as err:
                print("Skipping invalid row:", entry, "because:", err)

        return Response({"status": "success", "added": count}, status=status.HTTP_200_OK)
