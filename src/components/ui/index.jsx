// src/components/ui/index.js

/**
 * BARREL EXPORT (Exportación en Barril)
 *
 * ¿Qué es esto?
 * -------------
 * Este archivo actúa como un "punto de entrada único" para importar todos
 * los componentes de la carpeta ui/. Es como un "catálogo" o "índice".
 *
 * ¿Por qué se llama "barrel"?
 * ---------------------------
 * Porque agrupa múltiples exports en un solo lugar, como un barril que
 * contiene muchas cosas juntas.
 *
 * ¿Para qué sirve?
 * ----------------
 * Simplifica los imports. En lugar de escribir:
 *
 *   import Button from '../../components/ui/Button';
 *   import Card from '../../components/ui/Card';
 *   import Input from '../../components/ui/Input';
 *
 * Puedes escribir:
 *
 *   import { Button, Card, Input } from '../../components/ui';
 *
 * Ventajas:
 * ---------
 * ✅ Imports más limpios (menos líneas de código)
 * ✅ Más fácil de leer
 * ✅ Si movemos archivos, solo actualizamos este index.js
 * ✅ Mantiene el código organizado
 *
 * Sintaxis explicada:
 * -------------------
 * export { default as Button } from './Button';
 *    ↑       ↑        ↑            ↑
 *    │       │        │            └─ Archivo de origen (Button.jsx)
 *    │       │        └─ Nombre con el que se exporta
 *    │       └─ Importa el "export default" del componente
 *    └─ Re-exporta hacia afuera para que otros lo usen
 *
 * ¿Por qué es .js y no .jsx?
 * --------------------------
 * Este archivo NO contiene JSX (no hay HTML/componentes React).
 * Solo hace re-exportaciones, por eso es .js (JavaScript puro).
 */

// ============================================
// COMPONENTES UI
// ============================================

// Button: Botón reutilizable con variantes (primary, secondary, danger, ghost)
export { default as Button } from './Button';

// Badge: Etiquetas y contadores con variantes de color
export { default as Badge } from './Badge';

// Card: Contenedor reutilizable para contenido
export { default as Card } from './Card';

// Tabs: Sistema de pestañas con contenido
export { default as Tabs } from './Tabs';

// Input: Campo de input integrado con React Hook Form
export { default as Input } from './Input';

// Modal: Ventana modal reutilizable
export { default as Modal } from './Modal';

// TODO: Añadir más componentes aquí según se vayan creando
// Ejemplos futuros:
// export { default as Textarea } from './Textarea';
// export { default as Select } from './Select';
// export { default as Modal } from './Modal';
// export { default as Avatar } from './Avatar';
// export { default as Spinner } from './Spinner';
// export { default as Skeleton } from './Skeleton';

/**
 * CÓMO USAR ESTE BARREL EXPORT:
 *
 * Desde cualquier componente de la aplicación:
 *
 * import { Button, Input } from '../../components/ui';
 *
 * function MiComponente() {
 *   return (
 *     <>
 *       <Input label="Email" name="email" type="email" />
 *       <Button variant="primary" size="medium">
 *         Enviar
 *       </Button>
 *     </>
 *   );
 * }
 *
 * ¡Todo desde un solo import!
 */
