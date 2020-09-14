import groupBy from './utils/groupBy.js'

let thisDte = ''
let ords = []
let cartoninfo = []
let possibleStyleCol = []
let eligibleStyleColList = []
let dayOrds;
let possibleCtnsList;

// To Do: give phases sensible names

const phase1 = (ords) => {
    let svgUpdate = [];
    dayOrds = ords.filter((rec) => {
        return rec.dte.getTime() == thisDte.getTime();
    });
    const stats = groupBy(dayOrds, ['dte'], ['sqty'], ['carton', 'sku']);

    svgUpdate.push({ id: 'allLines', value: stats[0].cnt });
    svgUpdate.push({ id: 'allCtns', value: stats[0].carton_dcnt });
    svgUpdate.push({ id: 'allSkus', value: stats[0].sku_dcnt });
    svgUpdate.push({ id: 'allPairs', value: stats[0].sqty_sum });

    cartoninfo = groupBy(dayOrds, ['carton'], ['sqty'], ['style']);

    return svgUpdate;
}
const phase2 = () => {
    let svgUpdate = [];
    let possibleCtns = cartoninfo.filter(rec => rec.sqty_sum > 3 && rec.style_dcnt <= 3);
    svgUpdate.push({ id: 'posCtns', value: possibleCtns.length });

    possibleCtnsList = possibleCtns.map(function (obj) { return obj.carton });
    const possibleLines = dayOrds.filter(f => possibleCtnsList.includes(f.carton));
    possibleStyleCol = groupBy(possibleLines, ['styleCol'], ['sqty'], ['carton']);

    svgUpdate.push({ id: 'svg_27', value: possibleStyleCol.length });

    return svgUpdate;

}

const phase3 = () => {
    let svgUpdate = [];
    let eligibleStyleCol = possibleStyleCol.filter(rec => rec.sqty_sum > 250);
    svgUpdate.push({ id: 'eligibleStyleColor', value: eligibleStyleCol.length });

    eligibleStyleColList = eligibleStyleCol.map(function (obj) { return obj.styleCol });

    return svgUpdate;
}

const phase4 = () => {
    let svgUpdate = [];
    //find ctns with stles not in this list
    const notEligibleLines = dayOrds.filter(f => !eligibleStyleColList.includes(f.styleCol));
    console.log('notEligibleLines = ', notEligibleLines.length)
    const notEligibleCarton = notEligibleLines.map(function (obj) {
        return obj.carton;
    });
    //remove these from eligible cartons
    const eligibleCartonList = possibleCtnsList.filter(f => !notEligibleCarton.includes(f));
    console.log('eligibleCartonList = ', eligibleCartonList.length)
    //get orders for these ctns
    const keyOrdLines = dayOrds.filter(f => eligibleCartonList.includes(f.carton));

    let forDB = keyOrdLines.map(function (obj) {
        return [obj.dte, obj.carton, obj.sku, obj.sqty];
    });


    const activeLines = dayOrds.filter(f => !eligibleCartonList.includes(f.carton));
    console.log('activeLines = ', activeLines.length)
    forDB = activeLines.map(function (obj) {
        return [obj.dte, obj.carton, obj.sku, obj.sqty];
    });

    const stats1 = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku']);
    console.log(`stats1: ${stats1} `)
    svgUpdate.push({ id: 'keyLines', value: stats1[0].cnt });
    svgUpdate.push({ id: 'keyCtns', value: stats1[0].carton_dcnt });
    svgUpdate.push({ id: 'keySkus', value: stats1[0].sku_dcnt });
    svgUpdate.push({ id: 'keyPairs', value: stats1[0].sqty_sum });

    const stats2 = groupBy(activeLines, ['dte'], ['sqty'], ['carton', 'sku']);
    svgUpdate.push({ id: 'activeLines', value: stats2[0].cnt });
    svgUpdate.push({ id: 'activeCtns', value: stats2[0].carton_dcnt });
    svgUpdate.push({ id: 'activeSkus', value: stats2[0].sku_dcnt });
    svgUpdate.push({ id: 'activePairs', value: stats2[0].sqty_sum });

    return svgUpdate;

}

const execute = (ords, connection) => {
    let t1 = Date.now()
    console.log(t1);
    console.log(ords);
    let dtes = groupBy(ords, ['dte'], [], [])
    console.log(dtes);
    console.log('dtes = ', dtes.length)
    dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());

    for (var dte of dtes) {
        thisDte = dte.dte;
        console.log(thisDte)
        const svgUpdate1 = phase1(ords);
        connection.sendUTF(JSON.stringify({ "topic": "svgUpdate", "payload": svgUpdate1 }));

        const svgUpdate2 = phase2();
        connection.sendUTF(JSON.stringify({ "topic": "svgUpdate", "payload": svgUpdate2 }));

        const svgUpdate3 = phase3();
        connection.sendUTF(JSON.stringify({ "topic": "svgUpdate", "payload": svgUpdate3 }));

        const svgUpdate4 = phase4();
        connection.sendUTF(JSON.stringify({ "topic": "svgUpdate", "payload": svgUpdate4 }));
    }

    const t2 = Date.now()
    console.log(t2)
    console.log(t2 - t1)
}

export default execute;

