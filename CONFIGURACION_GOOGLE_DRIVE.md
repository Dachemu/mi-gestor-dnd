# 🔧 Configuración de Google Drive Sync

Esta guía te ayudará a configurar la sincronización automática con Google Drive para **Mi Gestor D&D**.

## 📋 **Requisitos**

- Cuenta de Google
- Acceso a [Google Cloud Console](https://console.cloud.google.com/)
- Navegador web moderno

## 🚀 **Configuración Paso a Paso**

### **Paso 1: Crear Proyecto en Google Cloud Console**

1. Ve a https://console.cloud.google.com/
2. Haz clic en **"Seleccionar proyecto"** → **"Nuevo proyecto"**
3. Nombre del proyecto: `Mi Gestor DnD` (o el que prefieras)
4. Haz clic en **"Crear"**

### **Paso 2: Habilitar Google Drive API**

1. En el menú lateral, ve a **"APIs y servicios"** → **"Biblioteca"**
2. Busca **"Google Drive API"**
3. Haz clic en **"Google Drive API"** → **"Habilitar"**

### **Paso 3: Configurar Pantalla de Consentimiento OAuth**

1. Ve a **"APIs y servicios"** → **"Pantalla de consentimiento OAuth"**
2. Selecciona **"Externo"** → **"Crear"**
3. Completa la información básica:
   - **Nombre de la aplicación**: `Mi Gestor DnD`
   - **Correo de soporte del usuario**: tu correo
   - **Dominio de la aplicación**: deja en blanco por ahora
   - **Correo de desarrollador**: tu correo
4. Haz clic en **"Guardar y continuar"**
5. En **"Alcances"**, haz clic en **"Añadir o eliminar alcances"**
6. Busca y selecciona: `../auth/drive.file`
7. Haz clic en **"Guardar y continuar"**
8. En **"Usuarios de prueba"**, añade tu correo electrónico
9. Haz clic en **"Guardar y continuar"**

### **Paso 4: Crear Credenciales OAuth 2.0**

1. Ve a **"APIs y servicios"** → **"Credenciales"**
2. Haz clic en **"Crear credenciales"** → **"ID de cliente de OAuth 2.0"**
3. Tipo de aplicación: **"Aplicación web"**
4. Nombre: `Mi Gestor DnD Web Client`
5. En **"Orígenes autorizados de JavaScript"**, añade:
   ```
   http://localhost:4000
   http://localhost:4001  
   http://127.0.0.1:4000
   http://127.0.0.1:4001
   ```
   (Y tu dominio de producción cuando lo tengas)
6. Haz clic en **"Crear"**
7. **¡GUARDA el Client ID!** Lo necesitarás en el siguiente paso

### **Paso 5: Crear API Key**

1. En **"Credenciales"**, haz clic en **"Crear credenciales"** → **"Clave de API"**
2. **¡GUARDA la API Key!** La necesitarás en el siguiente paso
3. (Opcional) Haz clic en **"Restringir clave"** para limitar su uso solo a Google Drive API

### **Paso 6: Configurar Variables de Entorno**

1. En la carpeta raíz del proyecto, copia `.env.example` a `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edita el archivo `.env` y completa tus credenciales:
   ```env
   VITE_GOOGLE_CLIENT_ID=123456789012-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
   VITE_GOOGLE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. Guarda el archivo

### **Paso 7: Verificar Configuración**

1. Inicia la aplicación:
   ```bash
   npm run dev
   ```

2. Ve al dashboard de cualquier campaña
3. En la esquina superior derecha deberías ver:
   - ✅ **"Sync no configurado"** si hay problemas con las credenciales
   - ✅ **"Desconectado"** si las credenciales son válidas
   - ✅ **"Modo desarrollo"** si está en modo mock

4. Haz clic en el indicador de sync para conectar

## 🧪 **Modo de Desarrollo (Sin Credenciales)**

Si no quieres configurar Google Drive ahora, puedes usar el modo mock:

```env
VITE_ENABLE_MOCK_SYNC=true
```

Esto simula todas las operaciones de sync sin conectar a Google Drive real.

## 🔒 **Consideraciones de Seguridad**

- **NUNCA** commits las credenciales reales al repositorio
- El archivo `.env` está en `.gitignore` por defecto
- Las variables `VITE_*` son públicas en el cliente (es seguro para Client ID y API Key)
- En producción, configura estas variables en tu hosting provider

## 🚨 **Resolución de Problemas**

### **Error: "Popup bloqueado"**
- Permite popups para el sitio en tu navegador
- Intenta desde una ventana de incógnito

### **Error: "Credenciales no válidas"**
- Verifica que copiaste correctamente el Client ID y API Key
- Asegúrate de que los dominios estén configurados en Google Cloud Console

### **Error: "API no habilitada"**
- Verifica que habilitaste Google Drive API en tu proyecto
- Espera unos minutos para que se propague

### **No aparece el indicador de sync**
- Verifica que las variables de entorno estén configuradas
- Revisa la consola del navegador para errores
- Reinicia el servidor de desarrollo

## 📞 **Soporte**

Si tienes problemas con la configuración:

1. Revisa los logs en la consola del navegador
2. Verifica que seguiste todos los pasos
3. Comprueba que tu proyecto de Google Cloud está activo

## 🎉 **¡Listo!**

Una vez configurado correctamente, podrás:

- ✅ Conectar automáticamente con Google Drive
- ✅ Sincronizar campañas en tiempo real  
- ✅ Resolver conflictos cuando hay cambios simultáneos
- ✅ Acceder a tus campañas desde cualquier dispositivo

---

**¿Necesitas ayuda?** Abre un issue en GitHub describiendo tu problema paso a paso.