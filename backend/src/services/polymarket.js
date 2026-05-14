/**
 * Servicio de integración con Polymarket Gamma API.
 *
 * Responsabilidades:
 *   - Fetch de mercados activos desde https://gamma-api.polymarket.com
 *   - Parseo y normalización de campos: id, question, outcomePrices, volume, liquidity, category, endDate
 *   - Persistencia en la tabla Market vía Prisma
 *   - Asignación de countryCode por geo-inferencia (delegado al pipeline de IA)
 *
 * No usa autenticación. No usa CLOB API.
 */
