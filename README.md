# Versus App - Sistema de Coins

Una aplicación web completa con sistema de compra de coins con verificación manual por administradores.

## Características

### Para Usuarios
- **Sistema de Autenticación**: Registro e inicio de sesión con email
- **Compra de Coins**: Interfaz intuitiva para comprar coins (S/. 2.00 por coin)
- **QR de Pago**: Modal con QR simulado para Yape
- **Subida de Comprobantes**: Carga de imágenes de comprobantes de pago
- **Historial de Transacciones**: Vista completa del estado de todas las transacciones
- **Balance de Coins**: Visualización en tiempo real del saldo disponible

### Para Administradores
- **Panel de Administración**: Gestión de todas las transacciones del sistema
- **Aprobación/Rechazo**: Proceso manual de verificación de pagos
- **Filtros por Estado**: Visualización filtrada por transacciones pendientes, aprobadas o rechazadas
- **Notas de Administrador**: Comentarios opcionales al rechazar transacciones
- **Seguridad**: Solo usuarios con permisos de administrador pueden acceder

## Tecnologías Utilizadas

### Backend
- **Django 4.2**: Framework web de Python
- **Django REST Framework**: API REST
- **SQLite**: Base de datos (configurable para producción)
- **Django CORS Headers**: Manejo de CORS para frontend

### Frontend
- **React 18**: Biblioteca de JavaScript
- **TypeScript**: Tipado estático
- **Tailwind CSS**: Framework de CSS
- **Lucide React**: Iconos
- **Axios**: Cliente HTTP

## Instalación y Configuración

### Prerrequisitos
- Python 3.8+
- Node.js 16+
- npm o yarn

### Backend

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd versus-app
```

2. **Activar entorno virtual**
```bash
source versus-app/bin/activate  # Linux/Mac
# o
versus-app\Scripts\activate     # Windows
```

3. **Instalar dependencias**
```bash
pip install -r requirements.txt
```

4. **Ejecutar migraciones**
```bash
python manage.py makemigrations
python manage.py migrate
```

5. **Crear superusuario (administrador)**
```bash
python manage.py createsuperuser
```

6. **Ejecutar servidor de desarrollo**
```bash
python manage.py runserver
```

### Frontend

1. **Navegar al directorio frontend**
```bash
cd frontend
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Ejecutar servidor de desarrollo**
```bash
npm run dev
```

## Uso del Sistema

### Flujo de Usuario Normal

1. **Registro/Login**: Crear cuenta o iniciar sesión
2. **Seleccionar Cantidad**: Elegir cuántos coins comprar (1-1000)
3. **Modal de Pago**: Ver QR simulado y total a pagar
4. **Subir Comprobante**: Cargar imagen del comprobante de Yape
5. **Esperar Aprobación**: La transacción queda en estado "Pendiente"
6. **Recibir Coins**: Una vez aprobada por admin, los coins se suman al balance

### Flujo de Administrador

1. **Acceso al Panel**: Solo usuarios con `is_staff=True` ven la pestaña "Administración"
2. **Revisar Transacciones**: Ver todas las transacciones pendientes
3. **Verificar Comprobantes**: Revisar las imágenes subidas por los usuarios
4. **Aprobar/Rechazar**: Tomar decisión sobre cada transacción
5. **Agregar Notas**: Comentarios opcionales al rechazar

## Estructura del Proyecto

```
versus-app/
├── api/                    # App principal de Django
│   ├── models.py          # Modelos: User, UserProfile, Transaction
│   ├── serializers.py     # Serializers para API
│   ├── views.py           # Vistas de la API
│   └── admin.py           # Configuración del admin de Django
├── backend/               # Configuración de Django
│   ├── settings.py        # Configuración del proyecto
│   └── urls.py            # URLs principales
├── frontend/              # Aplicación React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Auth, Coins)
│   │   └── App.tsx        # Componente principal
│   └── package.json
└── manage.py              # Script de gestión de Django
```

## API Endpoints

### Autenticación
- `POST /api/auth/register/` - Registro de usuario
- `POST /api/auth/login/` - Inicio de sesión
- `POST /api/auth/logout/` - Cerrar sesión
- `GET /api/auth/profile/` - Obtener perfil del usuario

### Coins y Transacciones
- `GET /api/coins/` - Obtener balance de coins
- `POST /api/transactions/` - Crear nueva transacción
- `GET /api/transactions/history/` - Historial de transacciones del usuario

### Administración (Solo Admin)
- `GET /api/admin/transactions/` - Todas las transacciones
- `PUT /api/admin/transactions/{id}/approve/` - Aprobar transacción
- `PUT /api/admin/transactions/{id}/reject/` - Rechazar transacción

## Seguridad

### Medidas Implementadas
- **Autenticación por Token**: Tokens JWT para sesiones
- **Autorización por Roles**: Solo admins pueden aprobar/rechazar
- **Validación de Datos**: Validación en frontend y backend
- **Transacciones Atómicas**: Operaciones de base de datos seguras
- **CORS Configurado**: Solo dominios autorizados

### Permisos
- **Usuarios Normales**: Solo pueden ver sus propias transacciones
- **Administradores**: Pueden ver y gestionar todas las transacciones
- **Superusuarios**: Acceso completo al sistema

## Configuración de Producción

### Variables de Entorno
```bash
DEBUG=False
SECRET_KEY=your-secret-key
ALLOWED_HOSTS=your-domain.com
DATABASE_URL=your-database-url
```

### Base de Datos
Para producción, se recomienda usar PostgreSQL:
```python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'your_db_name',
        'USER': 'your_db_user',
        'PASSWORD': 'your_db_password',
        'HOST': 'your_db_host',
        'PORT': '5432',
    }
}
```

### Archivos Media
Configurar almacenamiento de archivos para producción:
```python
MEDIA_URL = '/media/'
MEDIA_ROOT = '/path/to/media/files/'
```

## Contribución

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## Soporte

Para soporte técnico o preguntas, contactar a través de:
- Email: support@versus-app.com
- Issues: GitHub Issues
- Documentación: Wiki del proyecto
