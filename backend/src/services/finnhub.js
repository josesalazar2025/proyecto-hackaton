/**
 * Servicio de integración con Finnhub REST API.
 *
 * Responsabilidades:
 *   - Obtener titulares de noticias financieras relevantes.
 *   - Proporcionar noticias crudas al pipeline de IA para análisis de sentimiento.
 *
 * Restricciones:
 *   - Free tier: máximo 60 llamadas/minuto.
 *   - Solo se invoca durante la generación de señales (cada 5 min), no en cada sync de precios.
 */
