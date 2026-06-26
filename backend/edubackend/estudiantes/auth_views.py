from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.views import APIView
from django.utils import timezone

from .models import PerfilUsuario, PermisoRol, PERMISOS_DEFAULT, VISTAS_DISPONIBLES, ROLES


def _get_o_crear_perfil(user):
    perfil, _ = PerfilUsuario.objects.get_or_create(
        usuario=user,
        defaults={
            'rol': 'admin' if user.is_superuser else 'profesor',
            'aprobado': user.is_superuser,
        }
    )
    return perfil


def _get_vistas_permitidas(rol):
    permisos_db = PermisoRol.objects.filter(rol=rol)
    if permisos_db.exists():
        return [p.vista for p in permisos_db if p.puede_ver]
    return PERMISOS_DEFAULT.get(rol, ['home'])


def _user_data(user):
    try:
        perfil = user.perfil
    except PerfilUsuario.DoesNotExist:
        perfil = _get_o_crear_perfil(user)

    rol = 'admin' if user.is_superuser else perfil.rol
    vistas = list(VISTAS_DISPONIBLES) if user.is_superuser else _get_vistas_permitidas(rol)
    aprobado = user.is_superuser or perfil.aprobado

    return {
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'first_name': user.first_name,
        'last_name': user.last_name,
        'is_active': user.is_active,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'rol': rol,
        'aprobado': aprobado,
        'vistas_permitidas': vistas,
        'encargado_id': perfil.encargado_ref_id,
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def register_view(request):
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')

    if not username or not email or not password:
        return Response(
            {'detail': 'Por favor proporcione username, email y password'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if len(password) < 6:
        return Response(
            {'detail': 'La contraseña debe tener al menos 6 caracteres'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(username=username).exists():
        return Response(
            {'detail': 'El nombre de usuario ya está en uso'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if User.objects.filter(email=email).exists():
        return Response(
            {'detail': 'El correo electrónico ya está registrado'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name,
            is_active=True,
        )
        PerfilUsuario.objects.create(
            usuario=user,
            rol='profesor',
            aprobado=False,
        )
        return Response({
            'pendiente_aprobacion': True,
            'message': 'Registro exitoso. Su cuenta está pendiente de aprobación por el administrador.',
        }, status=status.HTTP_201_CREATED)

    except Exception as e:
        return Response(
            {'detail': f'Error al crear usuario: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    if not username or not password:
        return Response(
            {'detail': 'Por favor proporcione username y password'},
            status=status.HTTP_400_BAD_REQUEST
        )

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

    if not user.is_superuser:
        try:
            perfil = user.perfil
            if not perfil.aprobado:
                return Response(
                    {
                        'detail': 'Su cuenta está pendiente de aprobación por el administrador.',
                        'pendiente_aprobacion': True,
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
        except PerfilUsuario.DoesNotExist:
            PerfilUsuario.objects.create(usuario=user, rol='profesor', aprobado=False)
            return Response(
                {
                    'detail': 'Su cuenta está pendiente de aprobación por el administrador.',
                    'pendiente_aprobacion': True,
                },
                status=status.HTTP_403_FORBIDDEN
            )
    else:
        _get_o_crear_perfil(user)

    token, _ = Token.objects.get_or_create(user=user)

    return Response({
        'token': token.key,
        'user': _user_data(user),
    })


@api_view(['POST'])
def logout_view(request):
    if request.user.is_authenticated:
        try:
            request.user.auth_token.delete()
        except Exception:
            pass
    return Response({'detail': 'Sesión cerrada exitosamente'})


class UsuarioListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = User.objects.all().order_by('id')
        return Response([_user_data(u) for u in users])

    def post(self, request):
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Solo el administrador puede crear usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        nombre = request.data.get('nombre', '')
        apellido = request.data.get('apellido', '')
        rol = request.data.get('rol', 'administrador')

        if not username or not email or not password:
            return Response(
                {'detail': 'username, email y password son requeridos.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'El nombre de usuario ya está en uso.'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'El correo electrónico ya está registrado.'}, status=400)

        user = User(username=username, email=email, first_name=nombre, last_name=apellido)
        user.set_password(password)
        user.save()

        PerfilUsuario.objects.create(
            usuario=user,
            rol=rol,
            aprobado=True,
            aprobado_por=request.user,
            fecha_aprobacion=timezone.now(),
        )

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
            return Response({'detail': 'Usuario no encontrado.'}, status=404)

        if 'first_name' in request.data:
            user.first_name = request.data['first_name']
        if 'last_name' in request.data:
            user.last_name = request.data['last_name']
        if 'email' in request.data:
            email = request.data['email']
            if User.objects.filter(email=email).exclude(pk=pk).exists():
                return Response({'detail': 'El correo electrónico ya está en uso.'}, status=400)
            user.email = email

        user.save()

        if 'rol' in request.data and request.user.is_superuser:
            perfil, _ = PerfilUsuario.objects.get_or_create(
                usuario=user,
                defaults={'rol': 'profesor', 'aprobado': False}
            )
            perfil.rol = request.data['rol']
            perfil.save()

        return Response(_user_data(user))

    def delete(self, request, pk):
        user = self._get_user(pk)
        if user is None:
            return Response({'detail': 'Usuario no encontrado.'}, status=404)

        user.is_active = False
        user.save()
        return Response({'detail': 'Usuario desactivado correctamente.'})


class AprobarUsuarioView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Solo el administrador puede aprobar usuarios.'},
                status=status.HTTP_403_FORBIDDEN
            )

        try:
            user = User.objects.get(pk=pk)
        except User.DoesNotExist:
            return Response({'detail': 'Usuario no encontrado.'}, status=404)

        accion = request.data.get('accion', 'aprobar')
        rol = request.data.get('rol', 'administrador')

        if accion == 'rechazar':
            user.is_active = False
            user.save()
            return Response({'detail': 'Usuario rechazado y desactivado.'})

        perfil, _ = PerfilUsuario.objects.get_or_create(
            usuario=user,
            defaults={'rol': 'profesor', 'aprobado': False}
        )
        perfil.rol = rol
        perfil.aprobado = True
        perfil.aprobado_por = request.user
        perfil.fecha_aprobacion = timezone.now()

        encargado_id = request.data.get('encargado_id')
        if encargado_id and rol == 'encargado':
            from .models import Encargado
            try:
                perfil.encargado_ref = Encargado.objects.get(pk=encargado_id)
            except Encargado.DoesNotExist:
                pass

        perfil.save()

        return Response({
            'detail': 'Usuario aprobado correctamente.',
            'usuario': _user_data(user),
        })


class UsuariosPendientesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Solo el administrador puede ver usuarios pendientes.'},
                status=status.HTTP_403_FORBIDDEN
            )

        pendientes = PerfilUsuario.objects.filter(
            aprobado=False,
            usuario__is_active=True,
        ).select_related('usuario').order_by('fecha_registro')

        return Response([_user_data(p.usuario) for p in pendientes])


class PermisoRolView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Solo el administrador puede ver permisos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        resultado = {}
        for rol_code, rol_nombre in ROLES:
            permisos_db = {
                p.vista: p.puede_ver
                for p in PermisoRol.objects.filter(rol=rol_code)
            }
            defaults = PERMISOS_DEFAULT.get(rol_code, [])
            vistas_config = {
                vista: permisos_db[vista] if vista in permisos_db else (vista in defaults)
                for vista in VISTAS_DISPONIBLES
            }
            resultado[rol_code] = {
                'nombre': rol_nombre,
                'vistas': vistas_config,
            }

        return Response(resultado)

    def post(self, request):
        if not request.user.is_superuser:
            return Response(
                {'detail': 'Solo el administrador puede modificar permisos.'},
                status=status.HTTP_403_FORBIDDEN
            )

        rol = request.data.get('rol')
        vistas = request.data.get('vistas', {})

        if not rol or rol not in dict(ROLES):
            return Response({'detail': 'Rol inválido.'}, status=400)

        for vista, puede_ver in vistas.items():
            if vista in VISTAS_DISPONIBLES:
                PermisoRol.objects.update_or_create(
                    rol=rol,
                    vista=vista,
                    defaults={'puede_ver': bool(puede_ver)},
                )

        return Response({'detail': f'Permisos del rol {rol} actualizados correctamente.'})


class NotasEncargadoView(APIView):
    """Devuelve los cursos con notas de los estudiantes asociados al encargado autenticado."""
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            perfil = request.user.perfil
        except PerfilUsuario.DoesNotExist:
            return Response({'detail': 'Perfil no encontrado.'}, status=404)

        if not perfil.encargado_ref:
            return Response({'detail': 'No tiene un encargado vinculado.'}, status=400)

        from cursos.models import EstudianteCurso
        from cursos.serializers import CursoSerializer

        estudiantes = list(perfil.encargado_ref.estudiantes.filter(activo=True))
        est_ids = [e.id_estudiante for e in estudiantes]

        inscripciones = (
            EstudianteCurso.objects
            .filter(id_estudiante_id__in=est_ids)
            .select_related('id_curso', 'id_estudiante', 'id_curso__id_profesor')
            .order_by('id_curso__nombre', 'id_estudiante__nombre')
        )

        # Agrupar por curso
        cursos_mapa = {}
        for ins in inscripciones:
            cid = ins.id_curso.id_curso
            if cid not in cursos_mapa:
                cursos_mapa[cid] = {
                    'id_curso': cid,
                    'nombre': ins.id_curso.nombre,
                    'nivel_grado': ins.id_curso.nivel_grado,
                    'horario': ins.id_curso.horario,
                    'profesor_nombre': ins.id_curso.id_profesor.nombre,
                    'estudiantes': [],
                }
            cursos_mapa[cid]['estudiantes'].append({
                'id_estudiante_pk': ins.id_estudiante.id_estudiante,
                'nombre': ins.id_estudiante.nombre,
                'cedula': ins.id_estudiante.cedula,
                'nota': ins.nota,
            })

        return Response(list(cursos_mapa.values()))


@api_view(['POST'])
@permission_classes([AllowAny])
def recuperar_view(request):
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
