# Generated by Django 4.2.6 on 2025-01-23 01:53

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fipleapp', '0003_remove_contact_name_contact_responded_at_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='contact',
            name='responded_at',
        ),
        migrations.RemoveField(
            model_name='contact',
            name='response',
        ),
        migrations.RemoveField(
            model_name='contact',
            name='user',
        ),
        migrations.AddField(
            model_name='contact',
            name='name',
            field=models.CharField(default=1, max_length=100),
            preserve_default=False,
        ),
    ]
