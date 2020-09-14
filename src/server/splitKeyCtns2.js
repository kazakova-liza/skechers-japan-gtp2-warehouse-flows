import groupBy from './utils/groupBy.js'

let thisDte = ''
let ords = []
let cartoninfo = []
let possibleStyleCol = []
let eligableStyleColList = []


function phase1(ords, connection) {
    const svgUpdate = [];
    const dayOrds = ords.filter((rec) => {
        return rec.dte.getTime() == thisDte.getTime();
    });
    const stats = groupBy(dayOrds, ['dte'], ['sqty'], ['carton', 'sku']);

    // this.connection.sendUTF(JSON.stringify({ "topic": "tnow", "payload": this.tnow }))
    svgUpdate.push({ id: 'allLines', value: stats[0].cnt });
    svgUpdate.push({ id: 'allCtns', value: stats[0].carton_dcnt });
    svgUpdate.push({ id: 'allSkus', value: stats[0].sku_dcnt });
    svgUpdate.push({ id: 'allPairs', value: stats[0].sqty_sum });

    console.log(`sending update...`);
    connection.sendUTF(JSON.stringify({ "topic": "svgUpdate", "payload": svgUpdate }))

    cartoninfo = groupBy(dayOrds, ['carton'], ['sqty'], ['style'])
}
function phase2() {
    let possibleCtns = cartoninfo.filter(rec => rec.sqty_sum > 3 && rec.style_dcnt <= 3);
    //thingy.update('posCtns', possibleCtns.length)
    possibleCtnsList = possibleCtns.map(function (obj) { return obj.carton });
    possibleLines = dayOrds.filter(f => possibleCtnsList.includes(f.carton));
    possibleStyleCol = groupBy(possibleLines, ['styleCol'], ['sqty'], ['carton'])
    //thingy.update('posStyleColors', possibleStyleCol.length)
}

function phase3() {
    let eligableStyleCol = possibleStyleCol.filter(rec => rec.sqty_sum > 250);
    //thingy.update('eligbleStyleColor', eligableStyleCol.length)
    eligableStyleColList = eligableStyleCol.map(function (obj) { return obj.styleCol });
}

function phase4() {
    //find ctns with stles not in this list
    notEligableLines = dayOrds.filter(f => !eligableStyleColList.includes(f.styleCol));
    console.log('notEligableLines = ', notEligableLines.length)
    notEligableCarton = notEligableLines.map(function (obj) {
        return obj.carton;
    });
    //remove these from eligable cartons
    eligableCartonList = possibleCtnsList.filter(f => !notEligableCarton.includes(f));
    console.log('eligableCartonList = ', eligableCartonList.length)
    //get orders for these ctns
    keyOrdLines = dayOrds.filter(f => eligableCartonList.includes(f.carton));

    forDB = keyOrdLines.map(function (obj) {
        return [obj.dte, obj.carton, obj.sku, obj.sqty];
    });


    activeLines = dayOrds.filter(f => !eligableCartonList.includes(f.carton));
    console.log('activeLines = ', activeLines.length)
    forDB = activeLines.map(function (obj) {
        return [obj.dte, obj.carton, obj.sku, obj.sqty];
    });

    stats = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku'])
    //thingy.update('keyLines', stats[0].cnt)
    //thingy.update('keyCtns', stats[0].carton_dcnt)
    //thingy.update('keySkus', stats[0].sku_dcnt)
    //thingy.update('keyPairs', stats[0].sqty_sum)
    stats = groupBy(activeLines, ['dte'], ['sqty'], ['carton', 'sku'])
    //thingy.update('activeLines', stats[0].cnt)
    //thingy.update('activeCtns', stats[0].carton_dcnt)
    //thingy.update('activeSkus', stats[0].sku_dcnt)
    //thingy.update('activePairs', stats[0].sqty_sum)

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
        phase1(ords, connection);
        // phase2()
        // phase3()
        // phase4()
    }

    const t2 = Date.now()
    console.log(t2)
    console.log(t2 - t1)
}

export default execute;

