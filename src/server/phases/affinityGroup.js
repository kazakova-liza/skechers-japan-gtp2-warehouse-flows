import cache from '../cache.js'
import groupBy from '../utils/groupBy.js'
import objects from '../objects.js'

const affinityGroup = () => {
    const svgUpdate = [];
    const allGrps = {}
    //for(let grpNum = 0; grpNum < 500; grpNum++){
    let grpNum = 0
    while (cache.affAll.length > 0) {
        grpNum += 1
        let grpList = [cache.affAll[0].ord1]
        let affThreshold = 1
        for (let x = 0; x < 250; x++) {
            let candidate = cache.affAll.filter(checkAff => {
                const aa = grpList.includes(checkAff.ord1)
                const bb = checkAff.aff >= affThreshold
                const cc = grpList.includes(checkAff.ord2)
                return aa && bb && !cc
            })
            if (candidate.length == 0) {
                affThreshold = affThreshold / 1.5
                if (affThreshold < 0.05) {
                    candidate = [cache.affAll.find(checkAff => !(grpList.includes(checkAff.ord1)))]
                    if (candidate[0] == undefined) candidate = []
                    affThreshold = 1
                }
            }
            grpList = grpList.concat(candidate.map(a => a.ord2))
            grpList = Array.from(new Set(grpList))
            if (grpList.length > objects.groups) break
            //console.log(grpList.length, affAll.length)
        }
        if (grpList.length < objects.groups) {
            console.log('short')
        }
        grpList = grpList.slice(0, objects.groups)
        grpList.forEach(ctn => {
            allGrps[ctn] = grpNum
        })
        //REMOVE USED CARTONS FROM AFFINITY ARRAY
        cache.affAll = cache.affAll.filter(checkAff => {
            const aa = grpList.includes(checkAff.ord1)
            const bb = grpList.includes(checkAff.ord2)
            return !(aa || bb)
        })
        console.log(grpNum, grpList.length, cache.affAll.length)
    }

    cache.ords2 = cache.activeLines.map(ln => {
        ln.putGrp = allGrps[ln.carton]
        return ln
    })
    cache.ords2.sort((a, b) => { return a.sku.localeCompare(b.sku) || a.putGrp - b.putGrp });
    const affRes = groupBy(cache.ords2, ['putGrp'], ['sqty'], ['carton', 'sku'])
    //need to display average line, skus, cartons per group from affRes
    svgUpdate.push({ id: 'zzzz', value: cache.ords2.length });
    return svgUpdate;
}

export default affinityGroup;