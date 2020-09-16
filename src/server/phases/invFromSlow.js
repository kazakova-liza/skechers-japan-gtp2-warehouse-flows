import cache from '../cache.js';
import groupBy from '../utils/groupBy.js';

const invFromSlow = () => {
    const svgUpdate = [];
    
    svgUpdate.push({ id: 'someId', value: '1234' });

    return svgUpdate;
};

export default invFromSlow;