# 🚀 GUÍA COMPLETA DE LANZAMIENTO — ConverFast
## Paso a paso desde cero hasta producción

---

## ÍNDICE
1. Requisitos previos
2. Estructura del proyecto
3. Configuración local (desarrollo)
4. Dependencias del sistema operativo
5. Despliegue del Backend en Render.com
6. Despliegue del Frontend en Vercel
7. Dominio personalizado
8. SEO y Google Search Console
9. Google AdSense (monetización)
10. Google Analytics
11. Checklist de seguridad
12. Mantenimiento y escalado
13. Costes estimados

---

## 1. REQUISITOS PREVIOS

### Software necesario en tu máquina local
```bash
# Verifica que tienes instalado:
node --version    # Necesitas v18+ → https://nodejs.org
npm --version     # Viene con Node.js
git --version     # https://git-scm.com

# Cuentas gratuitas que necesitas crear:
# → GitHub:     https://github.com           (repositorio del código)
# → Vercel:     https://vercel.com           (hosting frontend - gratis)
# → Render.com: https://render.com           (hosting backend - $7/mes)
# → Namecheap:  https://namecheap.com        (dominio .com ~$12/año) OPCIONAL
```

---

## 2. ESTRUCTURA DEL PROYECTO

```
ConverFast/
├── backend/                  ← Servidor Node.js (API)
│   ├── server.js             ← Entrada principal del servidor
│   ├── package.json
│   ├── .env.example          ← Copia a .env y rellena
│   ├── routes/
│   │   ├── upload.js         ← POST /api/upload
│   │   └── convert.js        ← POST /api/convert
│   └── utils/
│       ├── converters.js     ← Lógica de conversión
│       ├── logger.js         ← Winston logger
│       ├── cleanup.js        ← Borrado automático de archivos
│       └── fileTypes.js      ← MIME types
├── frontend/                 ← App React + Vite
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ConversionPanel.jsx
│   │   │   ├── StatsBar.jsx
│   │   │   └── FormatGrid.jsx
│   │   └── pages/
│   │       ├── HomePage.jsx
│   │       ├── AboutPage.jsx
│   │       ├── PrivacyPage.jsx
│   │       ├── TermsPage.jsx
│   │       └── NotFound.jsx
│   ├── public/
│   │   ├── favicon.svg
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── vercel.json
│   └── package.json
├── render.yaml               ← Config despliegue Render.com
└── .gitignore
```

---

## 3. CONFIGURACIÓN LOCAL (DESARROLLO)

### Paso 3.1 — Inicializa el repositorio Git
```bash
cd ConverFast
git init
git add .
git commit -m "feat: initial commit - ConverFast MVP"
```

### Paso 3.2 — Configura el Backend
```bash
cd backend

# Instala dependencias de Node.js
npm install

# Crea el archivo de variables de entorno
cp .env.example .env

# Edita .env con tu editor favorito:
# PORT=3001
# NODE_ENV=development
# FRONTEND_URL=http://localhost:5173
# FILE_EXPIRY_MINUTES=60
# MAX_FILE_SIZE_MB=100
# UPLOAD_DIR=./tmp/uploads
# OUTPUT_DIR=./tmp/outputs
# SECRET_KEY=genera_una_clave_aqui_con_openssl_rand_-base64_32

# Arranca el servidor de desarrollo
npm run dev
# → Verás: "🚀 ConverFast Backend corriendo en puerto 3001"
```

### Paso 3.3 — Configura el Frontend
```bash
# En otra terminal:
cd frontend

# Instala dependencias
npm install

# Arranca el servidor de desarrollo
npm run dev
# → Vercel en: http://localhost:5173
```

### Paso 3.4 — Prueba local
Abre http://localhost:5173 en el navegador.
El proxy de Vite redirige /api/* al backend en localhost:3001 automáticamente.

---

## 4. DEPENDENCIAS DEL SISTEMA OPERATIVO

Para que el backend funcione al 100%, necesitas herramientas externas.
En producción (Render.com, Ubuntu), instálalas así:

### En Ubuntu/Debian (servidor de producción):
```bash
sudo apt-get update

# FFmpeg (audio/video)
sudo apt-get install -y ffmpeg

# Poppler (PDF a imagen)
sudo apt-get install -y poppler-utils

# LibreOffice (DOCX a PDF, máxima calidad)
sudo apt-get install -y libreoffice --no-install-recommends

# Python + pdf2docx (PDF a Word)
sudo apt-get install -y python3 python3-pip
pip3 install pdf2docx

# Ghostscript (compresión PDF)
sudo apt-get install -y ghostscript
```

### En macOS (desarrollo local):
```bash
brew install ffmpeg poppler
brew install --cask libreoffice
pip3 install pdf2docx
```

### En Windows (desarrollo local):
```
1. FFmpeg: https://ffmpeg.org/download.html → añadir al PATH
2. Poppler: https://github.com/oschwartz10612/poppler-windows/releases
3. LibreOffice: https://www.libreoffice.org/download/
4. Python: https://python.org → pip install pdf2docx
```

> NOTA: Sin estas herramientas, la mayoría de conversiones tienen
> fallbacks automáticos (básicos). El servidor NO fallará,
> pero la calidad será menor.

---

## 5. DESPLIEGUE DEL BACKEND EN RENDER.COM

### Paso 5.1 — Sube el código a GitHub
```bash
# En la raíz del proyecto ConverFast/
git add .
git commit -m "ready for deployment"

# Crea un repo en https://github.com/new (nombre: ConverFast)
git remote add origin https://github.com/TU_USUARIO/ConverFast.git
git branch -M main
git push -u origin main
```

### Paso 5.2 — Crea el servicio en Render.com
1. Ve a https://render.com y haz login (crea cuenta si no tienes)
2. Click en **"New +"** → **"Web Service"**
3. Conecta tu cuenta de GitHub y selecciona el repo `ConverFast`
4. Configura:
   - **Name**: ConverFast-backend
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Region**: Frankfurt (EU - más rápido para España)
   - **Branch**: main
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter ($7/mes) ← necesitas CPU para conversiones

### Paso 5.3 — Variables de entorno en Render
En la sección "Environment Variables" de tu servicio, añade:

```
NODE_ENV          = production
PORT              = 3001
FRONTEND_URL      = https://ConverFast.vercel.app   ← cambia por tu URL real
FILE_EXPIRY_MINUTES = 60
MAX_FILE_SIZE_MB  = 100
UPLOAD_DIR        = /tmp/uploads
OUTPUT_DIR        = /tmp/outputs
SECRET_KEY        = [genera con: openssl rand -base64 32]
```

### Paso 5.4 — Disco persistente (para archivos temporales)
En Render, ve a tu servicio → **"Disks"** → **"Add Disk"**:
- Name: ConverFast-storage
- Mount Path: `/tmp`
- Size: 5 GB

### Paso 5.5 — Instalar dependencias del sistema en Render
Crea el archivo `backend/build.sh`:
```bash
#!/bin/bash
npm install
apt-get update -y
apt-get install -y ffmpeg poppler-utils python3 python3-pip
pip3 install pdf2docx --break-system-packages || true
```

Y en Render, cambia Build Command a: `chmod +x build.sh && ./build.sh`

### Paso 5.6 — Verifica el backend
Tu backend estará disponible en:
`https://ConverFast-backend.onrender.com`

Prueba: `https://ConverFast-backend.onrender.com/api/health`
Deberías ver: `{"status":"ok","version":"1.0.0"}`

---

## 6. DESPLIEGUE DEL FRONTEND EN VERCEL

### Paso 6.1 — Instala Vercel CLI (opcional)
```bash
npm install -g vercel
```

### Paso 6.2 — Despliega desde la web (recomendado)
1. Ve a https://vercel.com/new
2. Importa el repositorio de GitHub
3. Configura:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Paso 6.3 — Variables de entorno en Vercel
En el dashboard de Vercel → Settings → Environment Variables:
```
VITE_API_URL = https://ConverFast-backend.onrender.com
```

### Paso 6.4 — Actualiza la URL del backend en vite.config.js
```javascript
// vite.config.js - en producción no necesitas proxy.
// El frontend llama a /api/* que apunta al backend directamente.
// Asegúrate de que en producción las llamadas a /api/* vayan al backend.
```

Para que el frontend llame al backend correcto en producción,
actualiza `frontend/src/` para usar la variable de entorno:

En cualquier fetch del frontend, la URL /api/... funciona en desarrollo
(gracias al proxy de Vite). En producción debes configurar que
`/api` apunte a tu backend en Render.

**Opción A (más sencilla) — Rewrites en Vercel:**
En `frontend/vercel.json`, añade:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://ConverFast-backend.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

**Opción B — Variable de entorno:**
```javascript
// En ConversionPanel.jsx y upload calls, usa:
const API_BASE = import.meta.env.VITE_API_URL || '';
const res = await fetch(`${API_BASE}/api/upload`, { ... });
```

### Paso 6.5 — Actualiza CORS en el backend
Una vez tengas la URL de Vercel (ej: ConverFast.vercel.app),
actualiza `FRONTEND_URL` en las variables de Render:
```
FRONTEND_URL = https://ConverFast.vercel.app
```

---

## 7. DOMINIO PERSONALIZADO

### Paso 7.1 — Compra el dominio
- Namecheap: https://namecheap.com (~$10-15/año para .com)
- Porkbun: https://porkbun.com (más barato, ~$9/año)
- Google Domains: https://domains.google

Busca: `converfast.com`, `ConverFast.io`, `convertfiles.app`, etc.

### Paso 7.2 — Conecta en Vercel
1. Vercel Dashboard → tu proyecto → Settings → Domains
2. Click "Add Domain" → escribe tu dominio
3. Copia los registros DNS que te da Vercel
4. Ve al panel DNS de Namecheap:
   - Añade registro **A** → IP de Vercel (76.76.21.21)
   - Añade registro **CNAME** www → cname.vercel-dns.com
5. Espera 5-30 minutos para propagación DNS
6. SSL se activa automáticamente (Let's Encrypt)

### Paso 7.3 — Conecta dominio al backend (opcional)
Si quieres `api.converfast.com` en lugar de la URL de Render:
1. En Namecheap, añade CNAME: `api` → tu-servicio.onrender.com
2. En Render → Custom Domains → añade `api.converfast.com`

---

## 8. SEO — GOOGLE SEARCH CONSOLE

### Paso 8.1 — Verifica la propiedad
1. Ve a https://search.google.com/search-console
2. "Añadir propiedad" → ingresa tu dominio
3. Verifica con método de archivo HTML:
   - Descarga el archivo de verificación
   - Colócalo en `frontend/public/`
   - Despliega y verifica

### Paso 8.2 — Envía el sitemap
1. En Search Console → Sitemaps
2. Añade: `https://tudominio.com/sitemap.xml`
3. Google tardará 1-4 semanas en indexar

### Paso 8.3 — Palabras clave objetivo (ya en el código)
El `index.html` ya incluye meta tags optimizados para:
- "convertir PDF a Word gratis"
- "conversor de archivos online"
- "convertir imágenes gratis"
- "PDF a JPG online"
- "MP4 a MP3 convertir"

---

## 9. GOOGLE ADSENSE (MONETIZACIÓN)

### Paso 9.1 — Solicita la cuenta
1. Ve a https://adsense.google.com
2. Solicita con tu dominio (necesitas al menos algo de contenido/tráfico)
3. Aprobación: 1-4 semanas

### Paso 9.2 — Integra los anuncios
Una vez aprobado, en `frontend/index.html` añade:
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXX" crossorigin="anonymous"></script>
```

Y en `ConversionPanel.jsx` (después de la descarga, no antes):
```jsx
{status === 'done' && (
  <div className="my-4">
    <ins className="adsbygoogle"
         style={{ display: 'block' }}
         data-ad-client="ca-pub-XXXXXXXXXX"
         data-ad-slot="XXXXXXXXXX"
         data-ad-format="auto" />
  </div>
)}
```

### Estrategia de anuncios recomendada:
- Anuncio 1: Debajo del resultado de conversión (máxima visibilidad, no intrusivo)
- Anuncio 2: Footer de la página principal
- NO pongas anuncios que interrumpan el flujo de conversión
- Evita anuncios en el dropzone (penalizan UX y CTR)

---

## 10. GOOGLE ANALYTICS

### Paso 10.1 — Crea la propiedad GA4
1. https://analytics.google.com
2. Crear propiedad → GA4
3. Copia el Measurement ID (G-XXXXXXXXXX)

### Paso 10.2 — Añade al proyecto
En `frontend/index.html`, descomenta y actualiza:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', { anonymize_ip: true });
</script>
```

### Eventos a trackear (añade en ConversionPanel.jsx):
```javascript
// Conversión iniciada
gtag('event', 'conversion_started', { from: file.ext, to: selectedFormat });

// Conversión completada
gtag('event', 'conversion_completed', {
  from: file.ext,
  to: selectedFormat,
  time_ms: result.conversionTime,
});

// Descarga
gtag('event', 'file_downloaded', { format: selectedFormat });
```

---

## 11. CHECKLIST DE SEGURIDAD ✅

Antes de lanzar, verifica:

```
[ ] HTTPS activo en frontend (Vercel lo hace automático)
[ ] HTTPS activo en backend (Render lo hace automático)
[ ] .env NO está en el repositorio Git (.gitignore configurado)
[ ] CORS configurado con tu dominio real (no *)
[ ] Rate limiting activo (ya incluido en server.js)
[ ] Tamaño máximo de archivo configurado (100MB)
[ ] Limpieza automática de archivos funcionando (cron cada 30min)
[ ] Helmet.js activo (headers de seguridad)
[ ] Variables de entorno en Render/Vercel (NO en el código)
[ ] SECRET_KEY generada con openssl rand -base64 32
[ ] Health check respondiendo en /api/health
```

---

## 12. MANTENIMIENTO Y ESCALADO

### Monitorización (gratis)
```bash
# Render ya incluye logs básicos en el dashboard
# Para alertas, añade UptimeRobot (gratis):
# → https://uptimerobot.com
# → Monitoriza https://tudominio.com/api/health cada 5 min
# → Email si cae
```

### Cuando crezcas (>1000 usuarios/día)
```
Acción 1: Actualiza Render a plan "Standard" ($25/mes) → más CPU para FFmpeg
Acción 2: Añade Redis para cola de conversiones (evita colapso)
Acción 3: CDN para descargas (Cloudflare Free Plan)
Acción 4: Considera S3 + CloudFront si los archivos temporales crecen mucho
```

### Comandos útiles de desarrollo
```bash
# Ver logs del backend en local
cd backend && npm run dev

# Build del frontend para producción
cd frontend && npm run build && npm run preview

# Lint del código
cd frontend && npm run lint

# Actualizar dependencias
npm update --save
```

---

## 13. COSTES ESTIMADOS

### Coste mensual real (primeros 6 meses)
```
Dominio (.com/año):         $12  → $1/mes
Render Starter (backend):   $7/mes
Vercel (frontend):          $0   (gratis Hobby)
Total:                      ~$8/mes = ~$96/año
```

### Ingresos potenciales con AdSense
```
1.000 visitas/día × 30 días = 30.000 visitas/mes
CPM España ~$1.5-3 = $45-90/mes (solo con 1k visitas/día)
5.000 visitas/día = $225-450/mes → rentable
10.000 visitas/día = $450-900/mes → muy rentable
```

### Escenario de crecimiento
```
Mes 1-2: SEO en marcha, 100-500 visitas/día. Coste neto: ~$8/mes
Mes 3-4: 500-2.000 visitas/día. AdSense cubre costes.
Mes 5-6: 2.000+ visitas/día. Beneficio neto positivo.
```

---

## RESUMEN RÁPIDO — ORDEN DE PASOS

```
1. [ ] git init + commit inicial
2. [ ] Sube a GitHub
3. [ ] Crea servicio en Render.com (backend)
4. [ ] Configura variables de entorno en Render
5. [ ] Despliega frontend en Vercel
6. [ ] Actualiza CORS y URLs
7. [ ] Compra dominio y conecta
8. [ ] Verifica dominio en Google Search Console
9. [ ] Envía sitemap.xml
10.[ ] Solicita Google AdSense
11.[ ] Añade Google Analytics
12.[ ] Activa monitorización con UptimeRobot
13.[ ] 🎉 LANZAMIENTO
```

---

*ConverFast — Hecho para durar, diseñado para escalar*
*Guía actualizada: marzo 2026*
