from rest_framework import serializers
from .models import Transaction
from datetime import datetime

class TransactionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transaction
        fields = '__all__'
    def create(self, validated_data):
        now = datetime.now()

        #default date and time if not provided
        if 'date' not in validated_data or validated_data['date'] is None:
            validated_data['date'] = now.date()

        if 'time' not in validated_data or validated_data['time'] is None:
            validated_data['time'] = now.time()

        return super().create(validated_data)