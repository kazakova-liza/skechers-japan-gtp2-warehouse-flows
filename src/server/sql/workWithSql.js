import mysql from 'mysql';
import util from 'util';


const connectToDatabase = () => {
    const config = {
        host: '192.168.1.210',//localhost
        user: "remoteuser",//root
        password: "remoteuser",//password
        database: "japan",//japan
    };

    // const config = {
    //     host: 'localhost',
    //     user: 'root',
    //     password: 'password',
    //     database: 'japan'
    // };
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


export default connectToDatabase;