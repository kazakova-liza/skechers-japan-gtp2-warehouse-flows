import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const invToSlow = () => {
    const svgUpdate = [];
    let slowDate = new Date(cache.thisDte)
    slowDate.setDate(cache.thisDte.getDate() - 3)
    const slow = cache.cases.filter(rck => {if (rck.dteUsed < slowDate && rck.qty > 0) {return true} else {return false } })
    cache.cases = cache.cases.filter(rck => {if (rck.dteUsed < slowDate && rck.qty > 0) {return false} else {return true } })
    cache.slowPairs = cache.slowPairs.concat(slow)
 
    let invQty = 0
    for (var rack of cache.cases) {invQty += rack.qty}

    let slowQty = 0
    for (var slw of cache.slowPairs) {slowQty += slw.qty}

    let slowMoveQty = 0
    for (var slw of slow) {slowMoveQty += slw.qty}

    svgUpdate.push({ id: 'invEndPairs', value: invQty });
    svgUpdate.push({ id: 'invEndCases', value: cache.cases.length });
    svgUpdate.push({ id: 'slowEndPairs', value: slowQty });
    svgUpdate.push({ id: 'slowEndCases', value: cache.slowPairs.length });
    svgUpdate.push({ id: 'slowMovePairs', value: slowMoveQty });
    svgUpdate.push({ id: 'slowMoveCases', value: slow.length });

    return svgUpdate;
};

export default invToSlow;