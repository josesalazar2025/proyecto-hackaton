/**
 * Servicio de integracion con Finnhub REST API.
 *
 * Responsabilidades:
 *   - Obtener titulares de noticias financieras.
 *   - Filtrar por keywords del mercado.
 *
 * Restricciones:
 *   - Free tier: maximo 60 llamadas/minuto.
 *   - Solo se invoca durante la generacion de senales (cada 5 min).
 *   - Si FINNHUB_API_KEY no esta configurado, devuelve array vacio.
 *
 * Consumido por:
 *   - aiPipeline.js → fase 1 de filtrado de noticias.
 */

