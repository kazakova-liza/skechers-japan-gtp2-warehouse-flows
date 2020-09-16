import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const invToSlow = () => {
    const svgUpdate = [];
    let slowDate = new Date(cache.thisDte)
    slowDate.setDate(cache.thisDte.getDate() - 3)
    const slow = cache.cases.filter(rck => {if (rck.dteUsed < slowDate) {return true} else {return false } })
    cache.cases = cache.cases.filter(rck => {if (rck.dteUsed < slowDate) {return false} else {return true } })

 
    let slowQty = 0
    for (var rack of cache.cases) {slowQty += rack.qty}

    let slowMoveQty = 0
    for (var slw of slow) {slowMoveQty += slw.qty}

    svgUpdate.push({ id: 'slowPairs', value: slowQty });
    svgUpdate.push({ id: 'slowCases', value: cache.slowPairs.length });
    svgUpdate.push({ id: 'slowMovePairs', value: slowMoveQty });
    svgUpdate.push({ id: 'slowMoveCases', value: slow.length });

    return svgUpdate;
};

export default invToSlow;