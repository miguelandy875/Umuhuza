# Generated manually for role system refactoring

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='is_seller',
            field=models.BooleanField(
                db_column='IS_SELLER',
                default=False,
                help_text='True if user has created at least one listing'
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='is_dealer',
            field=models.BooleanField(
                db_column='IS_DEALER',
                default=False,
                help_text='True if user is an approved dealer'
            ),
        ),
    ]
