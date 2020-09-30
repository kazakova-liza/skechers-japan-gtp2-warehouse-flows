

export const get = `SELECT carton, DATE(date2) AS dte, sqty, sku, 
        LEFT(sku,5) as style, LEFT(sku,12) as styleCol 
        FROM japan.TABLE_NAME_PLACEHOLDER 
        WHERE ttype = 'Pick' and  date(date2) between '2019-04-05' and '2019-04-08'`;

export const truncate = `TRUNCATE japan.TABLE_NAME_PLACEHOLDER`;

export const write = `INSERT INTO japan.TABLE_NAME_PLACEHOLDER VALUES ?`;



