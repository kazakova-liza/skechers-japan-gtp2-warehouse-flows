import cache from '../cache.js';

const assignInventory = () => {
    const svgUpdate = [];
    let todaypicks = []
    for (var line of cache.ords2) {
        let toPut = line.sqty
        for (var i = 0; i < cache.cases.length; i++) {
            if (cache.cases[i].sku == line.sku && cache.cases[i].qty > 0) {
                const pickQty = Math.min(toPut, cache.cases[i].qty)
                cache.cases[i].qty -= pickQty
                cache.cases[i].dteUsed = cache.thisDte
                if (line.putGrp == null) line.putGrp = 0
                todaypicks.push([cache.thisDte, line.sku, pickQty, cache.cases[i].rackNum, line.carton, line.putGrp])
                toPut -= pickQty
                if (toPut == 0) { break }
            }
        }
    }
    cache.cases = cache.cases.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    let rackQtyEnd = 0
    for (var rack of cache.cases) {rackQtyEnd += rack.qty}

    svgUpdate.push({ id: 'invMid3Pairs', value: rackQtyEnd });
    svgUpdate.push({ id: 'invMid3Cases', value: cache.cases.length });

    return svgUpdate;
}

export default assignInventory;