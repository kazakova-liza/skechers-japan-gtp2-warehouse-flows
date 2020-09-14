import groupBy from './utils/groupBy.js';
import cache from './cache.js';
import getData from './sql/getData.js';

let thisDte = '';
cache.racks = [];
// To Do: give phases sensible names

const getOrders = (ords) => {
  const svgUpdate = [];
  cache.dayOrds = ords.filter((rec) => rec.dte.getTime() == thisDte.getTime());
  const stats = groupBy(cache.dayOrds, ['dte'], ['sqty'], ['carton', 'sku']);

  svgUpdate.push({ id: 'allLines', value: stats[0].cnt });
  svgUpdate.push({ id: 'allCtns', value: stats[0].carton_dcnt });
  svgUpdate.push({ id: 'allSkus', value: stats[0].sku_dcnt });
  svgUpdate.push({ id: 'allPairs', value: stats[0].sqty_sum });

  cache.cartoninfo = groupBy(cache.dayOrds, ['carton'], ['sqty'], ['style']);

  return svgUpdate;
};
const findPossibleCartons = () => {
  const svgUpdate = [];
  const possibleCtns = cache.cartoninfo.filter((rec) => rec.sqty_sum > 3 && rec.style_dcnt <= 3);
  svgUpdate.push({ id: 'posCtns', value: possibleCtns.length });

  cache.possibleCtnsList = possibleCtns.map((obj) => obj.carton);
  const possibleLines = cache.dayOrds.filter((f) => cache.possibleCtnsList.includes(f.carton));
  cache.possibleStyleCol = groupBy(possibleLines, ['styleCol'], ['sqty'], ['carton']);

  svgUpdate.push({ id: 'svg_27', value: cache.possibleStyleCol.length });

  return svgUpdate;
};

const listEligibleStyleColor = () => {
  const svgUpdate = [];
  const eligibleStyleCol = cache.possibleStyleCol.filter((rec) => rec.sqty_sum > 250);
  svgUpdate.push({ id: 'eligibleStyleColor', value: eligibleStyleCol.length });

  cache.eligibleStyleColList = eligibleStyleCol.map((obj) => obj.styleCol);

  return svgUpdate;
};

const splitCartons = () => {
  const svgUpdate = [];
  // find ctns with stles not in this list
  const notEligibleLines = cache.dayOrds.filter((f) => !cache.eligibleStyleColList.includes(f.styleCol));
  console.log('notEligibleLines = ', notEligibleLines.length);
  const notEligibleCarton = notEligibleLines.map((obj) => obj.carton);
  // remove these from eligible cartons
  const eligibleCartonList = cache.possibleCtnsList.filter((f) => !notEligibleCarton.includes(f));
  console.log('eligibleCartonList = ', eligibleCartonList.length);
  // get orders for these ctns
  const keyOrdLines = cache.dayOrds.filter((f) => eligibleCartonList.includes(f.carton));

  let forDB = keyOrdLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);

  cache.activeLines = cache.dayOrds.filter((f) => !eligibleCartonList.includes(f.carton));
  console.log('activeLines = ', cache.activeLines.length);
  //forDB = activeLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);

  const stats1 = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku']);
  console.log(`stats1: ${stats1} `);
  svgUpdate.push({ id: 'keyLines', value: stats1[0].cnt });
  svgUpdate.push({ id: 'keyCtns', value: stats1[0].carton_dcnt });
  svgUpdate.push({ id: 'keySkus', value: stats1[0].sku_dcnt });
  svgUpdate.push({ id: 'keyPairs', value: stats1[0].sqty_sum });

  const stats2 = groupBy(cache.activeLines, ['dte'], ['sqty'], ['carton', 'sku']);
  svgUpdate.push({ id: 'activeLines', value: stats2[0].cnt });
  svgUpdate.push({ id: 'activeCtns', value: stats2[0].carton_dcnt });
  svgUpdate.push({ id: 'activeSkus', value: stats2[0].sku_dcnt });
  svgUpdate.push({ id: 'activePairs', value: stats2[0].sqty_sum });

  return svgUpdate;
};

const affinityprep = () => {
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
      if (grpList.length > 20) break
      //console.log(grpList.length, affAll.length)
    }
    if (grpList.length < 20) {
      console.log('short')
    }
    grpList = grpList.slice(0, 20)
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

const GetInventory = () => {
  const svgUpdate = [];
  let rackQtyStart = 0
  cache.racks = cache.racks.filter(rck => { if (rck.qty > 0) { return true } else { return false } })
  for (var rack of cache.racks) { rackQtyStart += rack.qty }
  cache.rackSkus = groupBy(cache.racks, ['sku'], ['qty'], [])
  svgUpdate.push({ id: 'z2', value: rackQtyStart });
  return svgUpdate;
}

const makeReplens = () => {
  const svgUpdate = [];

  let incRackNum = 0
  let usedRacks = cache.racks.map(rack => (rack.rackNum))
  let todayreplens = []
  let ordSkus = groupBy(cache.ords2, ['sku'], ['sqty'], [])
  for (var sku of ordSkus) {
    const rackInv = cache.rackSkus.find((obj) => {
      return obj.sku == sku.sku;
    });
    let inv = 0
    if (rackInv != undefined) { inv = rackInv.qty_sum }
    const rplnCtns = Math.ceil((sku.sqty_sum - inv) / 6)
    for (var i = 1; i <= rplnCtns; i++) {
      while (usedRacks.includes(incRackNum)) incRackNum++

      cache.racks.push({ "rackNum": incRackNum, "sku": sku.sku, "qty": 6, "dteUsed": thisDte })
      todayreplens.push([thisDte, sku.sku, 6, incRackNum])
      incRackNum++
    }
  }
  let replenctns = todayreplens.length
  
  let rackQtyMid = 0
  let rackCasesMid = 0
  for (var rack of cache.racks) {
    rackCasesMid++
    rackQtyMid += rack.qty
    if (rack.qty > 0) rackCasesMid++
  }
  svgUpdate.push({ id: 'z3', value: replenctns });
  return svgUpdate;
}

const assignInventory = () => {
  const svgUpdate = [];
  let todaypicks = []
  for (var line of cache.ords2) {
    let toPut = line.sqty
    for (var i = 0; i < cache.racks.length; i++) {
      if (cache.racks[i].sku == line.sku && cache.racks[i].qty > 0) {
        const pickQty = Math.min(toPut, cache.racks[i].qty)
        cache.racks[i].qty -= pickQty
        cache.racks[i].dteUsed = thisDte
        if (line.putGrp == null) line.putGrp = 0
        todaypicks.push([thisDte, line.sku, pickQty, cache.racks[i].rackNum, line.carton, line.putGrp])
        toPut -= pickQty
        if (toPut == 0) { break }
      }
    }
  }
  svgUpdate.push({ id: 'z4', value: 999 });

  return svgUpdate;
}

const blankOne = () => {
  const svgUpdate = [];

  svgUpdate.push({ id: 'zzzzz', value: 999 });

  return svgUpdate;
}

const execute = (ords, connection, phase, period) => {
  const t1 = Date.now();
  console.log(ords);

  const dtes = groupBy(ords, ['dte'], [], []);
  console.log(dtes);
  console.log('dtes = ', dtes.length);
  dtes.sort((a, b) => a.dte.getTime() - b.dte.getTime());
  //hello
  for (let i = 0; i < dtes.length; i++) {
    thisDte = dtes[i].dte;
    console.log(thisDte);
    if (i !== period) {
      continue;
    } else {
      if (phase === 1) {
        const svgUpdate1 = getOrders(ords);
        svgUpdate1.push({ id: 'phase', value: 'got orders' });
        svgUpdate1.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate1 }));
      }
      if (phase === 2) {
        const svgUpdate2 = findPossibleCartons();
        svgUpdate2.push({ id: 'phase', value: 'found possible cartons' });
        svgUpdate2.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate2 }));
      }

      if (phase === 3) {
        const svgUpdate3 = listEligibleStyleColor();
        svgUpdate3.push({ id: 'phase', value: 'found eligible style/colors' });
        svgUpdate3.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate3 }));
      }

      if (phase === 4) {
        const svgUpdate4 = splitCartons();
        svgUpdate4.push({ id: 'phase', value: 'split cartons' });
        svgUpdate4.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate4 }));
      }
      if (phase === 5) {
        const svgUpdate5 = affinityprep();
        svgUpdate5.push({ id: 'phase', value: 'Affinity martrix ready' });
        svgUpdate5.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate5 }));
      }
      if (phase === 6) {
        const svgUpdate6 = affinityGroup();
        svgUpdate6.push({ id: 'phase', value: 'Affinity groups ready' });
        svgUpdate6.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate6 }));
      }
      if (phase === 7) {
        const svgUpdate7 = GetInventory();
        svgUpdate7.push({ id: 'phase', value: 'Getting current inventory' });
        svgUpdate7.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate7 }));
      }
      if (phase === 8) {
        const svgUpdate8 = makeReplens();
        svgUpdate8.push({ id: 'phase', value: 'Calculating what needs replenishment' });
        svgUpdate8.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate8 }));
      }
      if (phase === 9) {
        const svgUpdate9 = assignInventory();
        svgUpdate9.push({ id: 'phase', value: 'Assigning inventory for cartons' });
        svgUpdate9.push({ id: 'period', value: dtes[i].dte.toDateString() });
        connection.sendUTF(JSON.stringify({ topic: 'svgUpdate', payload: svgUpdate9 }));
      }
    }
  }

  const t2 = Date.now();
  // console.log(t2)
  console.log(t2 - t1);
};


export default execute;
