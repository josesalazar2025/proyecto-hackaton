/**
 * Servicio de cálculo del Criterio de Kelly.
 *
 * Fórmula:
 *   k = (odds * pWin - pLose) / odds
 *   odds = (1 / yesPrice) - 1
 *   pLose = 1 - pWin
 *
 * Donde:
 *   - pWin      = confidence de la señal IA (0.0 a 1.0)
 *   - yesPrice  = precio actual del outcome YES en Polymarket
 *
 * El resultado se capa en 25% (máximo) y nunca es negativo.
 * Se almacena en Position.kellyFraction al abrir una posición.
 */
//Servicio de cálculo del Criterio de Kelly.
function calcCritKelly(yesPrice, pWin){
    const odds = (1 / yesPrice) - 1;
    const pLose = 1 - pWin;
    const k  = (odds * pWin - pLose) / odds;

    //El resultado se capa en 25% (máximo) y nunca es negativo.
    k = k < 0 ? 0 //si negativo
        : k > 0.25 //si positivo
        ? 0.25
        : k;



    return k;
}
