import connectToDatabase from './workWithSQL.js'
import chunk from 'lodash'
import cache from '../cache.js'


const executeQuery = async (action, tableName) => {
  const db = connectToDatabase();
  const get = `SELECT carton, DATE(date2) AS dte, sqty, sku, 
        LEFT(sku,5) as style, LEFT(sku,12) as styleCol 
        FROM japan.${tableName} 
        `;
  // WHERE ttype = 'Pick' 
  // and  date(date2) between '2019-04-05' and '2019-04-08'

  const truncate = `TRUNCATE japan.${tableName}`;

  const write = `INSERT INTO japan.${tableName} VALUES ?`;

  try {
    switch (action) {
      case 'getData':
        console.log(get);
        const records = await db.query(get);
        return records;
      case 'write':
        console.log(truncate);
        await db.query(truncate);
        console.log(`table truncated`);
        console.log(write);
        console.log(cache.dataForMySql);
        const dataChunked = chunk(cache.dataForMySql, 10000);
        // console.log(dataChunked);
        dataChunked.map(async (chunk) => {
          // console.log(chunk);
          await db.query(write, [chunk]);
        });
        break;
    }
  } catch (error) {
    console.log(error);
  } finally {
    // await db.close();
  }
};

export default executeQuery;
