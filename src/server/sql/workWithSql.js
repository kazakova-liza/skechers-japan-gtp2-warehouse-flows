import mysql from 'mysql';
import util from 'util';


function connectToDatabase(config) {
    const connection = mysql.createConnection(config);
    connection.connect();
    return {
        query(sql, args) {
            return util.promisify(connection.query).call(connection, sql, args);
        },
        close() {
            return util.promisify(connection.end).call(connection);
        },
    };
}

const db = connectToDatabase({
    host: '192.168.1.210',//localhost 192.168.1.210
    user: "remoteuser",//root remoteuser
    password: "remoteuser",//password remoteuser
    database: "japan",//japan
});

export default db;