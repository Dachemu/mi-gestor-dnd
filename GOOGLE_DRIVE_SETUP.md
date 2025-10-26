# 🚀 Configuración de Google Drive para Mi Gestor D&D

## 📋 Resumen

Este documento te guiará paso a paso para conectar tu aplicación con Google Drive y poder sincronizar automáticamente tus campañas.

---

## ⚡ Configuración Rápida (5 minutos)

### Paso 1: Acceder a Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Inicia sesión con tu cuenta de Google

### Paso 2: Crear un Proyecto

1. Haz clic en el selector de proyectos (arriba a la izquierda, al lado del logo de Google Cloud)
2. Haz clic en **"New Project"**
3. Nombre del proyecto: `Mi Gestor DnD` (o el que prefieras)
4. Haz clic en **"Create"**
5. Espera a que se cree (verás una notificación)

### Paso 3: Habilitar Google Drive API

1. Asegúrate de que el proyecto "Mi Gestor DnD" esté seleccionado
2. Ve a **"APIs & Services"** → **"Library"** (en el menú lateral izquierdo)
3. Busca `Google Drive API` en la barra de búsqueda
4. Haz clic en el resultado **"Google Drive API"**
5. Haz clic en el botón **"Enable"**
6. Espera a que se habilite (verás la pantalla de la API)

### Paso 4: Configurar Pantalla de Consentimiento OAuth

1. Ve a **"APIs & Services"** → **"OAuth consent screen"**
2. Selecciona **"External"** (para uso personal)
3. Haz clic en **"Create"**

#### Información de la aplicación:
- **App name**: `Mi Gestor DnD`
- **User support email**: Tu email de Google
- **App logo**: (opcional, puedes saltarlo)
- **Application home page**: (opcional)
- **Authorized domains**: (déjalo vacío por ahora)
- **Developer contact information**: Tu email de Google

4. Haz clic en **"Save and Continue"**

#### Scopes (Permisos):
5. Haz clic en **"Add or Remove Scopes"**
6. En el filtro, busca: `drive.file`
7. Selecciona la casilla de **`.../auth/drive.file`** (Vista y gestión de archivos de Google Drive creados con esta aplicación)
8. Haz clic en **"Update"** abajo
9. Haz clic en **"Save and Continue"**

#### Test users:
10. Haz clic en **"+ Add Users"**
11. Agrega tu email de Google (el que usarás para conectarte)
12. Haz clic en **"Add"**
13. Haz clic en **"Save and Continue"**

#### Resumen:
14. Revisa la información
15. Haz clic en **"Back to Dashboard"**

### Paso 5: Crear Credenciales OAuth 2.0

1. Ve a **"APIs & Services"** → **"Credentials"**
2. Haz clic en **"+ Create Credentials"** (arriba)
3. Selecciona **"OAuth client ID"**

#### Configuración del cliente:
- **Application type**: Selecciona **"Web application"**
- **Name**: `Mi Gestor DnD Web Client`

#### Authorized JavaScript origins:
4. Haz clic en **"+ Add URI"** dos veces y agrega:
   - `http://localhost:4000`
   - `http://127.0.0.1:4000`

**IMPORTANTE:** NO agregues nada en "Authorized redirect URIs" (déjalo vacío)

5. Haz clic en **"Create"**

### Paso 6: Copiar las Credenciales

Verás un popup con tus credenciales:

```
Your Client ID
123456789-abcdefghijklmno.apps.googleusercontent.com

Your Client Secret
GOCSPX-xxxxxxxxxxxxxxxxxxxxx
```

1. **Copia el Client ID completo** (la primera línea larga)
2. Abre el archivo `.env` en la raíz del proyecto
3. Pega el Client ID en `VITE_GOOGLE_CLIENT_ID`:

```env
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmno.apps.googleusercontent.com
```

4. **Copia SOLO los números antes del guión** para el App ID
   - Ejemplo: Si tu Client ID es `123456789-abcdefg.apps.googleusercontent.com`
   - Entonces copia solo: `123456789`

5. Pega el App ID en `VITE_GOOGLE_APP_ID`:

```env
VITE_GOOGLE_APP_ID=123456789
```

### Paso 7: Reiniciar el Servidor

1. Detén el servidor de desarrollo (Ctrl+C en la terminal)
2. Reinicia el servidor:
   ```bash
   npm run dev
   ```
3. Abre el navegador en `http://localhost:4000`

---

## ✅ Verificar que Funciona

1. En tu aplicación, haz clic en **"Conectar"** en el botón de Drive (esquina superior derecha)
2. Se abrirá un popup de Google pidiendo permisos
3. **IMPORTANTE:** Verás una advertencia "Google hasn't verified this app"
   - Esto es normal porque tu app está en modo de prueba
   - Haz clic en **"Advanced"** (Configuración avanzada)
   - Haz clic en **"Go to Mi Gestor DnD (unsafe)"** (Ir a Mi Gestor DnD - no seguro)
4. Autoriza los permisos solicitados
5. Selecciona la carpeta donde quieres guardar tus campañas
6. ¡Listo! Verás el icono de Drive en verde

---

## 🔧 Solución de Problemas

### Error: "Credenciales de Google no configuradas"
- Verifica que el archivo `.env` existe en la raíz del proyecto
- Verifica que las variables `VITE_GOOGLE_CLIENT_ID` y `VITE_GOOGLE_APP_ID` están configuradas
- Reinicia el servidor después de modificar el `.env`

### Error: "redirect_uri_mismatch"
- Ve a las credenciales en Google Cloud Console
- Asegúrate de que `http://localhost:4000` está en "Authorized JavaScript origins"
- NO debe haber nada en "Authorized redirect URIs"

### El popup no se abre
- Verifica que no estés bloqueando popups en tu navegador
- Intenta en modo incógnito
- Revisa la consola del navegador (F12) para ver errores

### "Google hasn't verified this app"
- Esto es normal para apps en desarrollo
- Haz clic en "Advanced" → "Go to Mi Gestor DnD (unsafe)"
- Solo tus test users (configurados en el paso 4) podrán acceder

---

## 📚 Recursos Adicionales

- [Documentación oficial de Google OAuth 2.0](https://developers.google.com/identity/protocols/oauth2)
- [Google Drive API Documentation](https://developers.google.com/drive/api/guides/about-sdk)

---

## 🔒 Seguridad

- Tus credenciales son públicas (van al navegador) pero **solo funcionan con los dominios autorizados**
- Nadie puede usar tus credenciales desde otro dominio
- Solo los test users que agregaste pueden conectarse mientras la app esté en modo de prueba
- Tus datos de campañas se guardan en TU Google Drive personal, nadie más tiene acceso

---

¡Listo! Ahora puedes sincronizar tus campañas de D&D con Google Drive automáticamente 🎲
