from django.contrib.auth import get_user_model

User = get_user_model()
user = User.objects.get(username='admin')
user.set_password('admin123')
user.first_name = 'Administrador'
user.last_name = 'Sistema'
user.save()
print('✅ Contraseña establecida para usuario admin')
print('   Usuario: admin')
print('   Contraseña: admin123')
