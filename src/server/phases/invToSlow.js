import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const invToSlow = () => {
    const svgUpdate = [];
    
    svgUpdate.push({ id: 'someId2', value: '1234' });

    return svgUpdate;
};

export default invToSlow;