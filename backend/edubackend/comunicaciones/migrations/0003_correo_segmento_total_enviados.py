from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('comunicaciones', '0002_adjunto'),
    ]

    operations = [
        migrations.AddField(
            model_name='correo',
            name='segmento',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='correo',
            name='total_enviados',
            field=models.IntegerField(default=0),
        ),
    ]
