# FersiÑam — catálogo estacional

Sitio estático para mostrar productos y enviar pedidos armados por WhatsApp. No necesita base de datos para el flujo actual.

## Actualizar una temporada

Toda la información editable está en `data/catalog.js`:

1. Cambia `campaign` para actualizar el texto y las dos imágenes principales.
2. Edita `products` para cambiar precios, descripciones e imágenes.
3. Usa `featured: true` en tres productos para elegir los destacados del inicio.
4. Usa `available: false` para mostrar un producto como agotado sin borrarlo.
5. Actualiza `whatsappNumber` e `instagramUrl` dentro de `business` si cambian.

Guarda las nuevas imágenes en la carpeta del proyecto y coloca su ruta en la propiedad `image`. Para que la página cargue rápido, se recomienda WebP o PNG de fondo transparente, con un ancho máximo aproximado de 1200 px.

El script `tools/optimize-images.py` deja copias WebP ligeras dentro de `assets/products` cuando se reemplazan las imágenes originales.

Las fotografías descargadas del Instagram oficial se conservan sin editar en `assets/instagram`. Sus versiones optimizadas para la web se generan en `assets/products`. En una ficha basada en fotografía usa `imageStyle: "photo"` para que la imagen ocupe correctamente toda la tarjeta.

## Identidad visual

La interfaz usa la paleta oficial compartida por FersiÑam: oliva `#7E8C65`, coral `#C95A4D`, ocre `#D49F4E`, verde claro `#C9D49A`, durazno `#E7A994` y amarillo `#F2D08A`. Los títulos usan Fraunces, el wordmark usa Berkshire Swash, los acentos manuscritos Kaushan Script y el texto general Manrope.

Para activar el cambio de imagen de una tarjeta, guarda la foto de la galleta partida en `assets/products` y coloca su ruta en `hoverImage` dentro de `data/catalog.js`. Si `hoverImage` queda vacío, la tarjeta sigue funcionando con una sola foto.

## Cuándo sí hará falta una base de datos

Recién será necesaria si se quiere confirmar stock automáticamente, cobrar en línea, gestionar estados de pedidos, crear cuentas de clientes o editar productos desde un panel privado. Mientras el cierre siga ocurriendo por WhatsApp, este enfoque es más simple y económico.
