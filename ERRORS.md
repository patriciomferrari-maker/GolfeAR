# 📋 Bitácora de Errores y Guía de Prevención — GolfeAR

Este documento registra los errores encontrados a lo largo del desarrollo de la aplicación, su causa raíz, la solución aplicada y las reglas obligatorias para evitar que se repitan en futuras iteraciones.

---

## ⚡ Reglas de Oro (Checklist rápido antes de cada commit/deploy)

1. **Sintaxis limpia**: Ejecutar siempre `node -c app.js` antes de comitear.
2. **Declaraciones al inicio**: Declarar e inicializar todas las variables `let` y `const` al inicio de su bloque o antes de cualquier lectura/condición.
3. **Funciones estándar + Window**: Toda función llamada desde HTML (`onclick="..."`) o desde otros módulos debe declararse con `function nombre() {}` y exportarse explícitamente con `window.nombre = nombre;`.
4. **IDs únicos en HTML**: Nunca repetir un `id` en el DOM; `document.getElementById` solo captura el primer nodo.
5. **Cache-busting obligatorio**: Incrementar el query string `v=XXX` en `index.html` tanto para `styles.css` como para `app.js` en cada despliegue a producción.

---

## 1. Errores de JavaScript y Ejecución

### 1.1 Temporal Dead Zone (TDZ) con `let` / `const`
* **Síntoma:** Al tocar botones como "Ver Detalle" o "Ver vs Compañero", la aplicación no respondía en absoluto y el modal no abría.
* **Causa Raíz:** En `setSelectedRoundForCard`, se evaluó la condición `if (holeTimes) { ... }` en la línea 2669, pero la variable estaba declarada más abajo en la línea 2707 con `let holeTimes = null;`. En JavaScript, acceder a una variable de bloque antes de su inicialización arroja un `ReferenceError: Cannot access 'holeTimes' before initialization` que interrumpe la ejecución de toda la función.
* **Solución aplicada:** Mover la extracción y parseo de `roundFir` y `holeTimes` a la parte superior de la función, antes de que cualquier bloque o `dateEl` intente consumirlos.
* **Regla preventiva:**
  ```javascript
  // ❌ INCORRECTO: uso antes de declarar
  if (datos) { procesar(datos); }
  let datos = extraerDatos();

  // ✅ CORRECTO: extraer primero, consumir después
  const datos = extraerDatos();
  if (datos) { procesar(datos); }
  ```

---

### 1.2 Declaración de Funciones: `window.fn` vs Declaración Léxica
* **Síntoma:** `ReferenceError: viewScorecard is not defined` al invocar `viewScorecardCompare()`.
* **Causa Raíz:** La función fue asignada únicamente como propiedad de ventana: `window.viewScorecard = function(id) { ... }`. Al llamarla directamente desde otra función interna como `viewScorecard(roundId)`, en ciertos contextos o bundles no se encuentra en el scope léxico.
* **Solución aplicada:** Declarar la función con la sintaxis clásica de función (que tiene hoisting completo) y asignarla en `window`:
  ```javascript
  function viewScorecard(roundId) {
    // Lógica...
  }
  window.viewScorecard = viewScorecard;
  ```

---

### 1.3 Funciones Utilitarias no Declaradas o Invocadas Prematuramente
* **Síntoma:** La pantalla principal no cargaba tarjetas de historial ni calculaba KPIs debido a errores como `updateLiveTimer is not defined` o `formatDate is not defined`.
* **Causa Raíz:** Funciones invocadas durante el arranque o en event listeners antes de que el script las interpretara, o eliminadas accidentalmente en refactorizaciones de UI.
* **Regla preventiva:** Las funciones utilitarias globales (`formatDate`, `openModal`, `closeModal`, `showToast`, cálculos de HCP) deben residir en la parte superior del archivo o garantizarse con hoisting estándar antes de las rutinas de inicialización (`DOMContentLoaded`).

---

## 2. Errores de DOM y Eventos

### 2.1 IDs Duplicados en el DOM
* **Síntoma:** El botón de GPS en la pantalla de juego no reaccionaba al tacto.
* **Causa Raíz:** Existían dos elementos `<button>` distintos con el mismo atributo `id="btn-live-gps"` (uno en el header/resumen y otro en la barra de acciones hero). `document.getElementById('btn-live-gps')` solo vinculaba el listener al primero, dejando al segundo completamente inerte.
* **Solución aplicada:**
  1. Dar IDs descriptivos y únicos a cada elemento (`btn-live-gps-hero`, `btn-live-gps-top`).
  2. Implementar delegación de eventos por clase o atributos de datos (`data-action="open-gps"`).
  3. Agregar fallbacks globales en `window` para llamadas inline si es necesario.

---

### 2.2 Event Bubbling y Disparo Cruzado de Eventos
* **Síntoma:** Al seleccionar jugar desde blancas/azules tocando la distancia en yardas, cambiaba el color de tee en vez de abrir el rangefinder GPS.
* **Causa Raíz:** El badge de distancia estaba anidado dentro del contenedor que cicla los tees de salida, y el click burbujeaba hacia el contenedor padre.
* **Solución aplicada:**
  - Separar los contenedores o usar `e.stopPropagation()` explícitamente en el elemento hijo para cortar la propagación del evento.

---

## 3. Errores de Lógica de Negocio y Datos

### 3.1 Pantalla en Blanco por Estado Vacío no Manejado en Dropdowns
* **Síntoma:** Al ingresar a la pestaña "Duelos vs Amigos", la pantalla quedaba completamente negra/vacía sin mostrar el selector ni el estado vacío.
* **Causa Raíz:** En `populateDuelosCompanions()`, cuando había amigos disponibles (`namesSet.size > 0`) pero aún no se había seleccionado ninguno (`!currentVal`), la condición `else if (namesSet.size > 0 && !currentVal)` estaba vacía, dejando ambos contenedores (`duelo-dashboard` y `duelo-empty-state`) con `display: none`.
* **Solución aplicada:** Auto-seleccionar automáticamente al primer amigo de la lista al cargar y renderizar la comparativa de inmediato:
  ```javascript
  if (namesSet.has(currentVal)) {
    select.value = currentVal;
    renderDueloComparison(currentVal);
  } else if (namesSet.size > 0) {
    const firstFriend = Array.from(namesSet).sort()[0];
    select.value = firstFriend;
    renderDueloComparison(firstFriend);
  } else {
    document.getElementById('duelo-dashboard').style.display = 'none';
    document.getElementById('duelo-empty-state').style.display = 'block';
  }
  ```

---

### 3.2 Fragilidad en Regex de Parseo de Notas
* **Síntoma:** Salidas que tenían compañeros registrados no mostraban el botón "👥 Ver vs Compañero" en el historial.
* **Causa Raíz:** La expresión regular exigía estrictamente el formato hoyo a hoyo `[H:6,6,12,...]`. Si una salida fue grabada sólo con golpes totales `(85 golpes, +13)` o tenía variaciones de codificación en caracteres especiales (`Compañeros` vs `Compaeros` vs `Compañeros`), el regex fallaba y devolvía un arreglo vacío.
* **Solución aplicada:**
  - Hacer opcional el bloque de hoyos con `(?:\[H:([0-9,]+)\])?`.
  - Admitir caracteres con o sin tildes/eñes: `Compa(?:ñ|\uFFFD|n)?eros:`.

---

### 3.3 Valores Nulos o Indefinidos en Datos de Partidas
* **Síntoma:** Errores `TypeError: Cannot read properties of undefined (reading 'toFixed')` al renderizar salidas manuales o importadas.
* **Causa Raíz:** Asumir que `round.scoreDifferential`, `round.course.courseRating` o `round.course.slopeRating` siempre existen.
* **Solución aplicada:** Operador de encadenamiento opcional y valores por defecto defensivos:
  ```javascript
  const diffVal = (round.scoreDifferential !== undefined && round.scoreDifferential !== null) 
    ? round.scoreDifferential.toFixed(1) 
    : '-';
  ```

---

## 4. Errores de UI Móvil y Responsive

### 4.1 Desborde Vertical y Scroll no Deseado en la Pantalla "Jugar"
* **Síntoma:** En dispositivos móviles, la pantalla de juego en vivo requería scrollear hacia abajo, tapaba los botones de "Terminar Ronda" y mostraba dos veces la barra de hoyos.
* **Causa Raíz:** Contenedores con alturas dinámicas excesivas, padding acumulado y falta de contención en el viewport.
* **Solución aplicada:**
  - Unificar la vista en una sola tarjeta "Hero" compacta sin scroll (`overflow: hidden`).
  - Distribuir putts y multas en dos columnas compactas con títulos superiores y contadores inferiores.
  - Asegurar que la barra de hoyos (1 al 9 o 1 al 18) quepa completa en pantalla mediante flexbox con `flex: 1` y tamaños de fuente adaptables.

---

### 4.2 Desigualdad en Tamaños de Botones de Navegación
* **Síntoma:** Los botones "Anterior" y "Siguiente" tenían anchos y rellenos asimétricos.
* **Solución aplicada:** Clases utilitarias con `flex: 1`, `min-height: 48px` (estándar táctil WCAG) y centrado idéntico en padding y tipografía.

---

## 5. Sensores y Geometría (GPS & Geolocation)

### 5.1 Inexactitud y Saltos en Lecturas de Distancia GPS
* **Síntoma:** El telémetro GPS mostraba fluctuaciones erráticas de distancia (+/- 30 yardas) entre mediciones consecutivas.
* **Causa Raíz:** Lecturas de señal única con alta incertidumbre de precisión (`accuracy > 30m`) tomadas de inmediato desde la caché del navegador.
* **Solución aplicada:**
  - Configurar `{ enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }`.
  - Descartar muestras con precisión pobre (`accuracy > 25m`).
  - Implementar muestreo con promedio de coordenadas cuando el usuario presiona "Medir Tiro" para estabilizar el punto de impacto.

---

## 6. Despliegue y Caché

### 6.1 Caché Persistente en Navegadores Móviles
* **Síntoma:** Tras corregir un bug y desplegar a Vercel, el usuario seguía experimentando el error en su celular hasta que borraba datos de navegación manualmente.
* **Causa Raíz:** Service Workers o cabeceras agresivas de caché de navegadores móviles para archivos estáticos (`app.js`, `styles.css`).
* **Solución obligatoria:**
  - En cada despliegue, actualizar el número de versión en `index.html`:
    ```html
    <link rel="stylesheet" href="styles.css?v=125">
    ...
    <script src="app.js?v=125"></script>
    ```

---

## 🛠️ Herramientas de Verificación Local

Antes de hacer `git push`:
```powershell
# 1. Validar sintaxis completa de JavaScript
node -c app.js

# 2. Comprobar que no hay errores de inicialización o llamadas nulas
node -e "const fs = require('fs'); eval(fs.readFileSync('app.js', 'utf8'));"
```
