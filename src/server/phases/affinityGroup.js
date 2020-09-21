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
            if (grpList.length > cache.groups) break
            //console.log(grpList.length, affAll.length)
        }
        if (grpList.length < cache.groups) {
            console.log('short')
        }
        grpList = grpList.slice(0, cache.groups)
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
    var stats = affRes.reduce((stats, grp) => {
        stats.grps++
        stats.skus += grp.sku_dcnt
        stats.ctns += grp.carton_dcnt
        stats.qty += grp.sqty_sum
        stats.lines += grp.cnt
        return stats
    }, { "grps": 0, "skus": 0, "ctns": 0, "qty": 0, "lines": 0 });

    svgUpdate.push({ id: 'groups', value: stats.grps });
    svgUpdate.push({ id: 'groupAvgLines', value: (stats.lines / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'groupAvgCartons', value: (stats.ctns / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'groupAvgSkus', value: (stats.skus / stats.grps).toFixed(1) });
    svgUpdate.push({ id: 'groupAvgPairs', value: (stats.qty / stats.grps).toFixed(1) });
    return svgUpdate;
}

export default affinityGroup;