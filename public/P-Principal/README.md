# Imágenes de la página principal

El banner existente se carga desde `public/P-Principal/Banner.png`.
Las imágenes pendientes muestran un fondo provisional; no se han añadido fotografías.

Añadir los archivos siguientes (los nombres distinguen mayúsculas en el despliegue):

- `Destinos/bocas-del-toro.jpg`
- `Destinos/ciudad-de-panama.jpg`
- `Destinos/boquete.jpg`
- `Destinos/el-valle.jpg`
- `Alojamientos/casa-del-mar.jpg`
- `Alojamientos/eco-lodge.jpg`
- `Alojamientos/refugio-de-montana.jpg`
- `Restaurantes/sabores-del-caribe.jpg`
- `Restaurantes/entre-montanas.jpg`
- `Restaurantes/mesa-panamena.jpg`
- `Actividades/snorkel-caribe.jpg`
- `Actividades/senderismo-boquete.jpg`
- `Actividades/casco-antiguo.jpg`
- `Experiencias/isla-grande.jpg`

Para cambiar nombres o extensiones, editar `src/data/home.ts`.
La ruta de Isla Grande está en `.experience-art` de `src/app/globals.css`.
Los datos, precios y valoraciones son ejemplos visuales de la referencia.

Las fuentes permanecen en `src/app/fonts` y se cargan con `next/font/local`.
No es necesario instalarlas ni moverlas a `public`.
Inter se carga localmente desde `InterVariable.woff2`; Segoe UI y system-ui son los fallbacks.
La licencia de Inter se conserva en `src/app/fonts/Inter-LICENSE.txt`.

La paleta global está definida en `src/app/globals.css`:
negro `#000000`, rojo `#CD2E4C` y azul `#4956A2`.
El blanco se conserva como fondo y contraste; las superficies usan transparencias de la paleta.

Los enlaces “Ver más” abren `/destinos`, `/alojamientos`, `/restaurantes` y `/actividades`.
Estas páginas comparten el catálogo de ejemplo; todavía no consultan una base de datos.

Los enlaces de redes sociales y privacidad quedan pendientes de sus destinos oficiales.
El crédito de Davis Marketing carga el archivo existente `public/DMarketing.svg`.

Las imágenes del catálogo son botones que abren una vista previa del servicio.
El menú móvil utiliza `public/Logo.svg` y un panel con transición desde abajo.
El nombre Ariel es un ejemplo de diseño; todavía no procede de una sesión autenticada.
Las rutas `/perfil`, `/perfil/seguridad` y `/perfil/configuracion` están preparadas.
El botón de cerrar sesión permanece deshabilitado hasta integrar la autenticación.
