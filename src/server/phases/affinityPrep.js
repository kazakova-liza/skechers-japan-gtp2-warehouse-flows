import cache from '../cache.js';

const affinityPrep = () => {
    const svgUpdate = [];
    const ctns = cache.activeLines.reduce((acc, ord) => {
        if (ord.carton in acc) {
            acc[ord.carton].push(ord.sku)
        } else {
            acc[ord.carton] = [ord.sku]
        }
        return acc
    }, [])
    const ctnList = Object.keys(ctns)
    console.log(ctnList.length);
    //MAKE AFFINITY ARRAY
    cache.affAll = []
    ctnList.forEach(o1 => {
        const ord1 = ctns[o1]
        const affinity = ctnList.reduce((acc, ord) => {
            if (ord == o1) return acc
            const ord2 = ctns[ord]
            const intercection = ord1.filter(x => ord2.includes(x))
            const difference = ord1.filter(x => !ord2.includes(x)).concat(ord2.filter(x => !ord1.includes(x)));
            const iLen = intercection.length
            const dLen = difference.length
            if (iLen > 0) {
                const aff = iLen / (dLen + iLen)
                acc.push({ "ord1": o1, "ord2": ord, "aff": aff, "ord1Len": ord1.length, "ord2Len": ord2.length })
            }
            return acc
        }, [])

        cache.affAll = cache.affAll.concat(affinity)
    });
    cache.affAll.sort((a, b) => b.aff - a.aff || b.ord1Len - a.ord1Len);
    svgUpdate.push({ id: 'matrixSize', value: cache.affAll.length });

    return svgUpdate;
}

export default affinityPrep;