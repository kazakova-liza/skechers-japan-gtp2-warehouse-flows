import cache from '../cache.js';

const listEligibleStyleColor = () => {
    const svgUpdate = [];
    const eligibleStyleCol = cache.possibleStyleCol.filter((rec) => rec.sqty_sum > 250);
    console.log(eligibleStyleCol);
    svgUpdate.push({ id: 'eligibleStyleColor', value: eligibleStyleCol.length });

    cache.eligibleStyleColList = eligibleStyleCol.map((obj) => obj.styleCol);

    return svgUpdate;
};

export default listEligibleStyleColor;