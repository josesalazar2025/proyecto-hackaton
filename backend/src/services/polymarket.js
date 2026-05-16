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


//- Fetch a todos los mercados activos desde https://gamma-api.polymarket.com
async function getAllMarkets(){

    let offset = 0;

    const all = [];

    while(true){

        const url =
          `${API_URL}?limit=${PAGE_SIZE}&offset=${offset}&active=true`;

        console.log("FETCH", url);

        const res =
          await fetch(url);

        const data =
          await res.json();

        if(!data.length){
            break;
        }

        all.push(...data);

        offset += PAGE_SIZE;

        await sleep(200);
    }

    return all;
}

//- Parseo y normalización de campos: id, question, outcomePrices, volume, liquidity, category, endDate
async function getNormalizedMarkets() {

    const markets =
      await getAllMarkets();

    const normalized =
      markets.map(market => ({

        id:
          market.id,

        question:
          market.question,

        outcomePrices:
          market.outcomePrices
            ? JSON.parse(market.outcomePrices)
            : [],

        volume:
          Number(market.volume || 0),

        liquidity:
          Number(market.liquidity || 0),

        category:
          market.category || "unknown",

        endDate:
          market.endDate
            ? new Date(market.endDate)
            : null
    }));

    return normalized;
}
