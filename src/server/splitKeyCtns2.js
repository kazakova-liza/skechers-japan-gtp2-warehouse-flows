import groupBy from './utils/groupBy.js';
import cache from './cache.js';
import getData from './sql/getData.js';

let thisDte = '';

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

  const activeLines = cache.dayOrds.filter((f) => !eligibleCartonList.includes(f.carton));
  console.log('activeLines = ', activeLines.length);
  forDB = activeLines.map((obj) => [obj.dte, obj.carton, obj.sku, obj.sqty]);

  const stats1 = groupBy(keyOrdLines, ['dte'], ['sqty'], ['carton', 'sku']);
  console.log(`stats1: ${stats1} `);
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
};

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
    }
  }

  const t2 = Date.now();
  // console.log(t2)
  console.log(t2 - t1);
};


export default execute;
