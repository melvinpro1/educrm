from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView


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

    # Intentar autenticar por username; si falla, buscar por email
    user = authenticate(username=username, password=password)

    if user is None:
        try:
            user_por_email = User.objects.get(email=username)
            user = authenticate(username=user_por_email.username, password=password)
        except User.DoesNotExist:
            pass

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


def _user_data(user):
    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
    }


class UsuarioListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response([_user_data(u) for u in users])

    def post(self, request):
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        nombre = request.data.get('nombre', '')

        if not username or not email or not password:
            return Response(
                {'detail': 'username, email y password son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'El nombre de usuario ya está en uso.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'El correo electrónico ya está registrado.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user = User(username=username, email=email, first_name=nombre)
        user.set_password(password)
        user.save()

        return Response(_user_data(user), status=status.HTTP_201_CREATED)


class UsuarioDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_user(self, pk):
        try:
            return User.objects.get(pk=pk)
        except User.DoesNotExist:
            return None

    def patch(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response(
                {'detail': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(pk=pk).exists():
                return Response(
                    {'detail': 'El correo electrónico ya está en uso.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            user.email = email

        user.save()
        return Response(_user_data(user))

    def delete(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response(
                {'detail': 'Usuario no encontrado.'},
                status=status.HTTP_404_NOT_FOUND
            )

        user.is_active = False
        user.save()
        return Response({'detail': 'Usuario desactivado correctamente.'})


@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_view(request):
    # TODO: integrar envío SMTP y token de recuperación con expiración de 24h.
    email = request.data.get('email', '').strip()
    password_nueva = request.data.get('password_nueva', '')

    if not password_nueva or len(password_nueva) < 6:
        return Response(
            {'detail': 'La contraseña debe tener al menos 6 caracteres.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.get(email=email, is_active=True)
    except User.DoesNotExist:
        return Response(
            {'detail': 'No se encontró una cuenta con ese correo.'},
            status=status.HTTP_404_NOT_FOUND
        )

    user.set_password(password_nueva)
    user.save()
    return Response(
        {'detail': 'Contraseña actualizada correctamente.'},
        status=status.HTTP_200_OK
    )
