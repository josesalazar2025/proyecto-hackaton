/**
 * Rutas REST para el simulador de posiciones con capital virtual.
 *
 * Endpoints:
 *   POST   /api/v1/positions       — abrir posición simulada (calcula fracción de Kelly)
 *   GET    /api/v1/positions       — listar posiciones del usuario con P&L actualizado
 *   DELETE /api/v1/positions/:id   — cerrar posición y calcular resultado final
 *
 * Usa userId=1 fijo para la demo.
 */
