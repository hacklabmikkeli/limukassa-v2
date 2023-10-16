const { mysql } = require('../config.json')
const mariadb = require('mariadb/callback');
 // Create a connection to the database
    con = mariadb.createConnection(mysql)

    // Query function
    function query(args) {
        if (!args.startsWith('SELECT *')) console.info('Query: ' + args);
        return new Promise((resolve, reject) => {
            con.query(args, (err, rows, fields) => {
                if (err) reject(err);
                resolve(rows, fields);
            }).on('error', err => reject(`Error: ${err.message}`));
        });
    };

    // getData function
    async function getData(table, where, options = {}) {
        const wherekeys = where ? Object.keys(where) : null;
        const WHERE = where ? wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ') : null;
        let data = await query(`SELECT * FROM ${table}${WHERE ? ` WHERE ${WHERE}` : ''}`);
        if (where && !options.nocreate && !data[0]) {
            await createData(table, where);
            data = await getData(table, where, { nocreate: true, all: true });
        }
        return options.all ? data : data[0];
    };

    // setData function
    async function setData(table, where, body) {
        const wherekeys = Object.keys(where);
        const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
        const bodykeys = Object.keys(body);
        const SET = bodykeys.map(k => { return `${k} = ${body[k] === null ? 'NULL' : `'${body[k]}'`}`; }).join(', ');
        const data = await query(`SELECT * FROM ${table} WHERE ${WHERE}`);
        console.info(`Set ${table} where ${JSON.stringify(where)} to ${JSON.stringify(body)}`);
        if (!data[0]) await createData(table, where);
        query(`UPDATE ${table} SET ${SET} WHERE ${WHERE}`);
    };

    // delData function
    async function delData(table, where) {
        const wherekeys = Object.keys(where);
        const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
        try {
            await query(`DELETE FROM ${table} WHERE ${WHERE}`);
            console.info(`${table} deleted where ${JSON.stringify(where)}!`);
        }
        catch (err) {
            console.error(`Error deleting ${table} where ${JSON.stringify(where)}: ${err}`);
        }
    };

    // createData function
    async function createData(table, body) {
        const bodykeys = Object.keys(body);
        const bodyvalues = Object.values(body);
        const VALUES = bodyvalues.map(v => { return v === null ? 'NULL' : `'${v}'`; }).join(', ');
        try {
            await query(`INSERT INTO ${table} (${bodykeys.join(', ')}) VALUES (${VALUES})`);
            console.info(`Created ${table}: ${JSON.stringify(body)}`);
        }
        catch (err) {
            console.error(`Error creating ${table}: ${err}`);
        }
    };
    module.exports = {
        getData,
        setData,
        delData,
        createData
}