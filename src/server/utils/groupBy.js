function groupBy(frm, bys, sums, dcnts) {
  const res3 = {};
  const dcntArr = {};
  for (const record of frm) {
    const thisByRecArr = [];
    let thisByRecName = '';
    for (const by of bys) {
      const thisByRec = record[by];
      let thisBy = 'null';
      if (thisByRec != null) {
        thisBy = thisByRec;
      }
      thisByRecArr.push(thisBy);
      thisByRecName += (`${thisBy}-`);
    }
    if (!(thisByRecName in res3)) { // NEW ROW
      const newRec2 = {};
      for (let a = 0; a < bys.length; a++) {
        newRec2[bys[a]] = thisByRecArr[a];
      }
      newRec2.cnt = 0;
      for (const sum of sums) {
        newRec2[`${sum}_sum`] = 0;
      }
      dcntArr[thisByRecName] = {};
      for (const dcnt of dcnts) {
        newRec2[`${dcnt}_dcnt`] = 0;
        dcntArr[thisByRecName][dcnt] = new Set();
      }
      res3[thisByRecName] = newRec2;
    }

    res3[thisByRecName].cnt += 1;
    for (const sum of sums) {
      res3[thisByRecName][`${sum}_sum`] += record[sum];
    }
    for (const dcnt of dcnts) {
      dcntArr[thisByRecName][dcnt].add(record[dcnt]);
      res3[thisByRecName][`${dcnt}_dcnt`] = dcntArr[thisByRecName][dcnt].size;
    }
  }
  const res4 = [];
  for (const [key, value] of Object.entries(res3)) {
    res4.push(value);
  }
  return res4;
}

export default groupBy;
