import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const findPossibleCartons = () => {
    const svgUpdate = [];
    const possibleCtns = cache.cartoninfo.filter((rec) => rec.sqty_sum > 3 && rec.style_dcnt <= 3);
    svgUpdate.push({ id: 'posCtns', value: possibleCtns.length });

    cache.possibleCtnsList = possibleCtns.map((obj) => obj.carton);
    const possibleLines = cache.dayOrds.filter((f) => cache.possibleCtnsList.includes(f.carton));
    cache.possibleStyleCol = groupBy(possibleLines, ['styleCol'], ['sqty'], ['carton']);
    console.log(cache.possibleStyleCol);

    svgUpdate.push({ id: 'svg_27', value: cache.possibleStyleCol.length });

    return svgUpdate;
};

export default findPossibleCartons;