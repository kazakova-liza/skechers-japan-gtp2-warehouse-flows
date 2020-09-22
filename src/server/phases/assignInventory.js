import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const assignInventory = () => {
    const svgUpdate = [];
    let todaypicks = []
    let ords3 = []
    cache.ords2.sort((a, b) => a.putGrp - b.putGrp)
    for (var line of cache.ords2) {
        let toPut = line.sqty
        for (var i = 0; i < cache.cases.length; i++) {
            if (cache.cases[i].sku == line.sku && cache.cases[i].qty > 0) {
                const pickQty = Math.min(toPut, cache.cases[i].qty)
                cache.cases[i].qty -= pickQty
                cache.cases[i].dteUsed = cache.thisDte
                if (line.putGrp == null) line.putGrp = 0
                todaypicks.push([cache.thisDte, line.sku, pickQty, cache.cases[i].rackNum, line.carton, line.putGrp]) //can go to MySQL (check a sequence of columns table), add a button, dialog box for a table name
                ords3.push({ "dte": cache.thisDte, "sku": line.sku, "qty": pickQty, "rackNum": cache.cases[i].rackNum, "carton": line.carton, "grp": line.putGrp })
                toPut -= pickQty
                if (toPut == 0) { break }
            }
        }
    }

    cache.dataForMySql = ords3;

    cache.cases = cache.cases.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
    let rackQtyEnd = 0
    for (var rack of cache.cases) { rackQtyEnd += rack.qty }

    svgUpdate.push({ id: 'invMid3Pairs', value: rackQtyEnd });
    svgUpdate.push({ id: 'invMid3Cases', value: cache.cases.length });
    let res = groupBy(ords3, ["grp"], ["qty"], ["rackNum", "carton", "sku"])
    var stats = res.reduce((stats, grp) => {
        stats.grps++
        stats.skus += grp.sku_dcnt
        stats.ctns += grp.carton_dcnt
        stats.racks += grp.rackNum_dcnt
        stats.qty += grp.qty_sum
        stats.lines += grp.cnt
        return stats
    }, { "grps": 0, "skus": 0, "ctns": 0, "racks": 0, "qty": 0, "lines": 0 });
    svgUpdate.push({ id: 'finGroups', value: stats.grps });
    svgUpdate.push({ id: 'finGroupAvgLines', value: (stats.lines / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'finGroupAvgCartons', value: (stats.ctns / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'finGroupAvgSkus', value: (stats.skus / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'finGroupAvgPairs', value: (stats.qty / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'finGroupAvgRacks', value: (stats.racks / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'finAvgPairsPerCase', value: (stats.qty / stats.racks).toFixed(1) });
    svgUpdate.push({ id: 'robotVisits', value: stats.racks });

    return svgUpdate;
}

export default assignInventory;