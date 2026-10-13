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
- `/public/` - Archivos estáticos.
  - `/public/styles/` - Estilos: `base.css` (tokens y layout) y `calendar.css` (componentes).
- `package.json` - Dependencias y scripts.
- `tsconfig.json` - Configuración estricta de TypeScript.
- `.gitignore`

## 3. Reglas de Desarrollo y Calidad de Código
- **Tipado Estricto:** Uso obligatorio de TypeScript. **Prohibido** el uso de `any`. Define interfaces o tipos explícitos para cada estructura de datos.
- **Principios SOLID y Clean Code:** Funciones puras, alta cohesión, bajo acoplamiento y nombres semánticos en inglés para variables, funciones y tipos.
- **Manejo de Errores:** Controla las excepciones de forma explícita; no dejes bloques `catch` vacíos.
- **Responsive:** Diseño fluido con `clamp()` y tres niveles: `≥1024px` dos columnas (calendario + panel del día), `700–1023px` una sola columna apilada y `<700px` móvil. Objetivos táctiles de al menos 44px y sin depender de `:hover` en táctil.
- **Arrastre (táctil y ratón):** usa Pointer Events con pulsación larga en táctil; no reintroducir el DnD nativo HTML5 (no funciona en táctil). El color del arrastre viaja con la tarea.

## 4. Restricciones del Entorno y Comandos
- **Restricción de Entorno (WSL / Windows):** El proyecto reside en el sistema de archivos de Windows y se opera desde WSL. La IA **no dispone** de los comandos del proyecto (`npm run dev`, `npm run build`, `npm run typecheck`, `npm run preview`, `git`, etc.): no debe ejecutarlos, ni darlos por hechos, ni asumir su resultado.
- **Modo Plan:** Mientras la IA trabaje en modo Plan no debe entregar código; solo debe explicar qué hará.
- **Protocolo de Comandos:** 
  1. Cada vez que se requiera ejecutar un comando (compilación, instalación de paquetes, pruebas), la IA **debe proponerlo por escrito**, indicando el comando exacto y el directorio de trabajo.
  2. El desarrollador humano será el único encargado de ejecutarlo en su terminal local (Windows).
  3. La IA no debe reportar resultados de comandos que no haya propuesto ni que el humano no haya ejecutado.

## 5. Protocolo de Trabajo para la IA
- Lee este archivo de directivas antes de iniciar cualquier tarea, y modifícalo si es necesario.
- Lee MEMORY.md para conocer el estado del proyecto y las decisiones tomadas. 
- Mantén el código modular, legible y fácil de mantener.
- Mantén el diseño y estilo: lee DESIGN.md
