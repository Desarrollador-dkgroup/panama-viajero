# Logo oficial de Panamá Viajero

Extraído de `MANUAL DE IDENTIDAD PANAMÁ VIAJERO Editable_compressed.pdf` (raíz del
proyecto), renderizado a 600dpi con Poppler (`pdftoppm`) y recortado/recoloreado a
transparente con `sharp` — sin retipear el nombre ni aproximar la tipografía; el
wordmark es la imagen tal como aparece en el manual.

| Archivo | Origen en el manual | Uso |
|---|---|---|
| `logotype-positivo.png` | Página 1 (portada) — isologo completo (recuadro azul + símbolo blanco/rojo + "Panamá Viajero" en gris oscuro), la misma pieza que se repite en la página 3 ("Presentación y descripción del Logotipo") | Sobre fondos claros/blancos |
| `logotype-negativo.png` | Página 7 ("Positivo y Negativo"), panel izquierdo — variante oficial para fondos oscuros: recuadro blanco + símbolo oscuro + "Panamá Viajero" en blanco | Sobre fotos y fondos oscuros — Bienvenida, pantalla morada de arranque |
| `icon.png` | Página 3 — solo el símbolo (recuadro azul + ave/avión blanco y rojo), sin el wordmark | Espacios reducidos donde no cabe el logotipo completo |
| `icon-negativo.png` | Recortado del mismo panel de la página 7 — solo el símbolo (recuadro blanco + ave/avión oscuro) | Logo pequeño de login/registro/recuperar contraseña (fondos oscuros, sin wordmark) |
| `google-icon.png` | No es del manual — es el ícono "G" multicolor oficial de Google (los 4 colores de marca), generado localmente para reemplazar el ícono monocromo de Ionicons | Botón "Continuar con Google" |
| `symbol-transparent.png` | Derivado de `icon.png` — el mismo símbolo (ave/avión blanco + cinta roja/coral), pero con el recuadro azul puesto a transparente en vez de recoloreado, para que quede SOLO el símbolo, sin caja, listo para flotar directo sobre el fondo índigo de la pantalla de carga | Símbolo centrado de la pantalla morada de arranque (`animated-icon.tsx`) y `app.json` (imagen de la splash nativa) |
| `wordmark-transparent.png` | Recortado de `logotype-negativo.png` — solo el wordmark "Panamá Viajero" en blanco, sin el recuadro/símbolo de la izquierda | Nombre que aparece con fundo suave en la pantalla de carga, debajo del símbolo, para formar el logo completo |

La paleta (`CD2E4C`, `4956A2`, `4D4C4C`, `EBEBEB`, `FFFFFF`, página 5 del manual) ya
coincidía exactamente con `Brand` en `src/constants/theme.ts`.

Antes de esta corrección, `promo-logo-icon.png` (una palmera dentro de un círculo) se
usaba como sustituto en toda la app porque el manual nunca se había abierto — no
aparece en ninguna página del manual y debe considerarse un placeholder heredado, no
el símbolo real.

## Corrección de `logotype-positivo.png`: "j" recortada

La primera extracción recortaba el lienzo exactamente a los píxeles con contenido, sin
dejar margen — eso cortó literalmente la cola descendente (y casi el punto) de la "j"
de "Viajero", que quedaba como una barra vertical sin gancho. Se regeneró desde cero:

1. Página 3 del manual, re-renderizada a 600dpi con Poppler, recortada esta vez con
   margen generoso alrededor de todo el isologo (verificado píxel a píxel que la "j"
   completa — punto y gancho — y la "á" de "Panamá" quedan enteras dentro del recorte).
2. El recuadro del símbolo se re-key a transparente con el mismo algoritmo de distancia
   de color de siempre, pero esta vez erosionaba el blanco del ave/avión (demasiado
   parecido al gris de fondo de la página del manual) — se resolvió componiendo el
   símbolo directamente desde `icon.png` (ya extraído y verificado sin ese problema) en
   vez de re-recortarlo de la página.
3. El wordmark ("Panamá Viajero") sí se re-key desde la página 3 sin problema (no tiene
   partes blancas) y se compuso junto al símbolo con el espaciado y proporciones
   medidos del original.
4. El resultado final (1600×598) se recortó con ~140px de margen uniforme alrededor del
   contenido (símbolo + texto) — el archivo anterior no tenía prácticamente margen.

`welcome-screen.tsx` ya no pone una placa blanca detrás del logo — se muestra
directamente sobre la fotografía, con un degradado suave (`topTint`) que oscurece solo
la parte superior de la foto para dar contraste al wordmark gris oscuro.

## Símbolo y wordmark sueltos para la pantalla de carga

`symbol-transparent.png` y `wordmark-transparent.png` se generaron con el mismo método de
re-key por distancia de color que el resto de este directorio (ver script de la sesión
que hizo este cambio), nunca retipeando el nombre ni redibujando el símbolo:

1. `symbol-transparent.png`: se parte de `icon.png` (recuadro azul + símbolo blanco/rojo),
   se detectan los píxeles cuyo color está a una distancia corta del azul de marca exacto
   (`#4956A2`) y se ponen en alpha 0 en vez de recolorearlos — dejando solo el símbolo
   (blanco + rojo) con fondo transparente. Los píxeles de borde con alpha intermedio se
   redondean a 0 o 255 (igual que en `build-app-icon.js`) para no dejar un halo semitransparente
   del color de la caja. Se recorta (`trim`) al contenido real.
2. `wordmark-transparent.png`: se parte de `logotype-negativo.png` (que ya tiene el texto
   en blanco sobre fondo transparente), se detecta dónde termina el bloque opaco de la
   insignia (escaneando la fila central, no la superior, para no toparse con las esquinas
   redondeadas) y el espacio en blanco que sigue, y se recorta todo lo que queda a la
   derecha de ese espacio — es decir, solo el wordmark, sin el símbolo ni su caja.

Ambos se verificaron compuestos sobre un lienzo `#4956A2` (el mismo índigo de fondo real)
antes de incorporarse, para confirmar que no quedó ningún fleco del color de la caja
alrededor del símbolo ni del texto.

## Ícono de la app (portada principal)

`assets/images/icon.png`, `assets/images/ios-icon.png`, `assets/images/android-icon-*.png`
y `assets/images/favicon.png` se generan a partir de `icon.png` (arriba, página 3 del
manual, versión "positivo" azul) compuesto sobre un lienzo del mismo azul exacto
(`#4956A2`) — antes esos archivos eran el ícono genérico de la plantilla de Expo (la
flecha blanca sobre azul), nunca reemplazado. El icon composer nativo de iOS
(`assets/expo.icon/`, también genérico) ya no se usa — `ios.icon` en `app.json` apunta
directo a `ios-icon.png`. Script de generación (no forma parte del build):
`build-app-icon.js` en el scratchpad de la sesión que hizo este cambio.
