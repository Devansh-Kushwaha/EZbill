# Generated by Django 5.2.4 on 2025-07-20 08:44

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('transaction', '0006_transaction_time_alter_transaction_date'),
    ]

    operations = [
        migrations.AlterField(
            model_name='transaction',
            name='type',
            field=models.CharField(choices=[('income', 'Income'), ('expense', 'Expense')], default='expense', max_length=10),
        ),
        migrations.DeleteModel(
            name='Tag',
        ),
    ]
