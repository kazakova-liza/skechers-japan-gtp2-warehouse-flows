import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';
import executeQuery from '../sql/executeQuery.js'

const getOrders = async () => {
    if (cache.ords == undefined) {
        cache.ords = await executeQuery(getData, cache.table);
    }

    const svgUpdate = [];
    cache.dayOrds = cache.ords.filter((rec) => rec.dte.getTime() == cache.thisDte.getTime());
    const stats = groupBy(cache.dayOrds, ['dte'], ['sqty'], ['carton', 'sku']);

    svgUpdate.push({ id: 'allLines', value: stats[0].cnt });
    svgUpdate.push({ id: 'allCtns', value: stats[0].carton_dcnt });
    svgUpdate.push({ id: 'allSkus', value: stats[0].sku_dcnt });
    svgUpdate.push({ id: 'allPairs', value: stats[0].sqty_sum });

    cache.cartoninfo = groupBy(cache.dayOrds, ['carton'], ['sqty'], ['style']);

    return svgUpdate;
};

export default getOrders;