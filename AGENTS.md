# AGENTS.md — NoteBookHome

## 1. Contexto y Visión General
- **Rol:** Eres un Desarrollador Full-Stack Senior experto en arquitectura de software, principios SOLID, diseño limpio y código mantenible.
- **Descripción:** Aplicación web de calendario para gestión y anotación de tareas.
- **Tech Stack:** 
  - TypeScript (Estricto)
  - HTML5 / CSS3 (Moderno)
  - Vite (servidor de desarrollo y empaquetado)
  - Sin frameworks de UI: se usa la API nativa del DOM
  - Entorno: Proyecto alojado en sistema de archivos de Windows y ejecutado desde WSL.

## 2. Estructura del Proyecto
- `index.html` - Punto de entrada del navegador; Vite lo requiere en la raíz.
- `/src/` - Código fuente en TypeScript, organizado por capas:
  - `/src/domain/` - Tipos y funciones puras (sin DOM ni almacenamiento).
  - `/src/data/` - Repositorios: interfaz + implementación sobre `localStorage`.
  - `/src/services/` - Lógica de negocio y notificación de cambios.
  - `/src/ui/` - Componentes de interfaz que renderizan y emiten eventos.
  - `/src/main.ts` - Composition root: inyecta dependencias y arranca la aplicación.
- `/public/` - Archivos estáticos (estilos base en `/public/styles/`).
- `package.json` - Dependencias (`vite`, `typescript`) y scripts.
- `tsconfig.json` - Configuración estricta de TypeScript.
- `.gitignore` - Excluye `node_modules/` y `dist/`.

## 3. Reglas de Desarrollo y Calidad de Código
- **Tipado Estricto:** Uso obligatorio de TypeScript. **Prohibido** el uso de `any`. Define interfaces o tipos explícitos para cada estructura de datos.
- **Principios SOLID y Clean Code:** Funciones puras, alta cohesión, bajo acoplamiento y nombres semánticos en inglés para variables, funciones y tipos.
- **Manejo de Errores:** Controla las excepciones de forma explícita; no dejes bloques `catch` vacíos.

## 4. Restricciones del Entorno y Comandos
- **Restricción de Entorno (WSL / Windows):** Está estrictamente prohibido que la IA ejecute comandos automáticamente en la terminal, ya que el proyecto reside en Windows y se opera desde WSL.
- **Modo Plan:** Mientras la IA trabaje en modo Plan no debe entregar código; solo debe explicar qué hará.
- **Protocolo de Comandos:** 
  1. Cada vez que se requiera ejecutar un comando (compilación, instalación de paquetes, pruebas), la IA **debe proponerlo por escrito**.
  2. El desarrollador humano será el único encargado de ejecutarlo en su terminal local.

## 5. Protocolo de Trabajo para la IA
- Lee este archivo de directivas antes de iniciar cualquier tarea, y modificalo si es necesario.
- Lee MEMORY.md para conocer el estado del proyecto y las decisiones tomadas. 
- Mantén el código modular, legible y fácil de mantener.
- Manten el diseño y estilo lee DESIGN.md