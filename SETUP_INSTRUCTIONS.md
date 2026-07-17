# Casa106 Web - Instrucciones de Setup

## ✅ Verificación de configuración completada

Todos los archivos están correctamente configurados:

- ✅ `package.json` - Configurado con Vite 5.4.8, React 18.3.1, TypeScript 5.6.2
- ✅ `vite.config.ts` - Configurado con proxy para API en `https://localhost:7210`
- ✅ `tsconfig.json` - Configurado para React + JSX
- ✅ `index.html` - Punto de entrada configurado
- ✅ `src/main.tsx` - React root configurado
- ✅ `src/App.tsx` - Componente principal con conexión a API
- ✅ `package-lock.json` - Dependencies bloqueadas

## 🚀 Pasos para levantar la aplicación

### Requisito previo: Node.js
Verifica que tengas Node.js instalado:
```bash
node --version  # Debe ser v18+ o superior
npm --version   # Debe ser 9+ o superior
```

Si no tienes Node.js, descargalo de: https://nodejs.org/ (versión LTS recomendada)

### 1. Instala las dependencias
```bash
cd src\Casa106.Web
npm install
```

### 2. Levanta el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en: **https://localhost:5173**

## 📋 Puerto de la API

El proxy está configurado para conectar a:
- **URL:** `https://localhost:7210`
- **Archivo de configuración:** `vite.config.ts` línea 53

Si tu API está en un puerto diferente, actualiza la URL en `vite.config.ts`:
```typescript
target: 'https://localhost:XXXX/' // Cambiar XXXX por tu puerto
```

## 🛑 Troubleshooting

### "Port already in use"
Cambia el puerto en `vite.config.ts` línea 56:
```typescript
port: 5174 // o cualquier otro puerto disponible
```

### "Cannot connect to API"
1. Verifica que el API está corriendo en `https://localhost:7210`
2. Revisa que no haya errores de CORS en la consola del navegador
3. Comprueba que el proxy en `vite.config.ts` sea correcto

### "Cannot find module"
```bash
rm -r node_modules
npm install
```

### Certificado HTTPS
El proyecto genera automáticamente un certificado autofirmado. Si tienes problemas:
```bash
dotnet dev-certs https --clean
dotnet dev-certs https --trust
```

## 📝 Scripts disponibles

```bash
npm run dev      # Inicia servidor de desarrollo (Vite)
npm run build    # Compila TypeScript + Vite build
npm run preview  # Previsualiza el build en local
```

## 🔗 URLs útiles

- **Web React:** https://localhost:5173
- **API Swagger:** https://localhost:7210/swagger
- **Vite Hot Module Reload:** Automático al guardar

---

¡Listo! Tu aplicación React debería estar funcionando. 🎉
