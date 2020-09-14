import db from './workWithSQL.js'

const getData = async (tableName) => {
    try {
        const sql1 = `SELECT carton, DATE(date2) AS dte, sqty, sku, 
        LEFT(sku,5) as style, LEFT(sku,12) as styleCol 
        FROM japan.${tableName} 
        WHERE ttype = 'Pick' and  date(date2) between '2019-04-05' and '2019-04-8'
        `;
        // const sql1 = `SELECT *
        // FROM japan.${tableName} 
        // WHERE date(date2) = '2019-04-05'`;
        console.log(sql1);
        const data = await db.query(sql1);
        console.log('SQL done')
        return data;
    } catch (error) {
        console.log(error);
    } finally {
        //await db.close();
    }
};

export default getData;