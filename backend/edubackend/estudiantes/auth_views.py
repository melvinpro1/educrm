from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authtoken.models import Token


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    """
    Endpoint para registrar un nuevo usuario
    Acepta username, email, password, first_name, last_name
    """
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    # Validaciones
    if not username or not email or not password:
        return Response(
            {'detail': 'Por favor proporcione username, email y password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Validar longitud de contraseña
    if len(password) < 6:
        return Response(
            {'detail': 'La contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si el username ya existe
    if User.objects.filter(username=username).exists():
        return Response(
            {'detail': 'El nombre de usuario ya está en uso'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Verificar si el email ya existe
    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'El correo electrónico ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        # Crear el usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )

        # Crear token automáticamente
        token = Token.objects.create(user=user)

        # Retornar token y datos del usuario
        return Response({
            'token': token.key,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_superuser': user.is_superuser,
            },
            'message': 'Usuario registrado exitosamente'
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'detail': f'Error al crear usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    """
    Endpoint para iniciar sesión
    Acepta username/email y password
    Retorna token de autenticación y datos del usuario
    """
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Por favor proporcione username y password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Intentar autenticar
    user = authenticate(username=username, password=password)

    if user is None:
        return Response(
            {'detail': 'Credenciales incorrectas'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    if not user.is_active:
        return Response(
            {'detail': 'Usuario inactivo'},
            status=status.HTTP_401_UNAUTHORIZED
        )

    # Obtener o crear token
    token, created = Token.objects.get_or_create(user=user)

    # Retornar token y datos del usuario
    return Response({
        'token': token.key,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
            'is_superuser': user.is_superuser,
        }
    })


@api_view(['POST'])
def logout_view(request):
    """
    Endpoint para cerrar sesión
    Elimina el token del usuario
    """
    if request.user.is_authenticated:
        # Eliminar el token del usuario
        try:
            request.user.auth_token.delete()
        except:
            pass

    return Response({'detail': 'Sesión cerrada exitosamente'})
