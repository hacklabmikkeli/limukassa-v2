const { mysql } = require('../config.json')
const mariadb = require('mariadb/callback');
module.exports = async client => {


    // Create a connection to the database
    client.con = mariadb.createConnection(mysql)

    // Query function
    client.query = function query(args) {
        if (!args.startsWith('SELECT *')) console.info('Query: ' + args);
        return new Promise((resolve, reject) => {
            client.con.query(args, (err, rows, fields) => {
                if (err) reject(err);
                resolve(rows, fields);
            }).on('error', err => reject(`Error: ${err.message}`));
        });
    };

    // getData function
    client.getData = async function getData(table, where, options = {}) {
        const wherekeys = where ? Object.keys(where) : null;
        const WHERE = where ? wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ') : null;
        let data = await client.query(`SELECT * FROM ${table}${WHERE ? ` WHERE ${WHERE}` : ''}`);
        if (where && !options.nocreate && !data[0]) {
            await client.createData(table, where);
            data = await getData(table, where, { nocreate: true, all: true });
        }
        return options.all ? data : data[0];
    };

    // setData function
    client.setData = async function setData(table, where, body) {
        const wherekeys = Object.keys(where);
        const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
        const bodykeys = Object.keys(body);
        const SET = bodykeys.map(k => { return `${k} = ${body[k] === null ? 'NULL' : `'${body[k]}'`}`; }).join(', ');
        const data = await client.query(`SELECT * FROM ${table} WHERE ${WHERE}`);
        console.info(`Set ${table} where ${JSON.stringify(where)} to ${JSON.stringify(body)}`);
        if (!data[0]) await client.createData(table, where);
        client.query(`UPDATE ${table} SET ${SET} WHERE ${WHERE}`);
    };

    // delData function
    client.delData = async function delData(table, where) {
        const wherekeys = Object.keys(where);
        const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
        try {
            await client.query(`DELETE FROM ${table} WHERE ${WHERE}`);
            console.info(`${table} deleted where ${JSON.stringify(where)}!`);
        }
        catch (err) {
            client.guilds.cache.get('771906593386135562').channels.cache.get('1093561649484546130').send({ content: `<@&132946883134881792> ${err}` });
            console.error(`Error deleting ${table} where ${JSON.stringify(where)}: ${err}`);
        }
    };

    // createData function
    client.createData = async function createData(table, body) {
        const bodykeys = Object.keys(body);
        const bodyvalues = Object.values(body);
        const VALUES = bodyvalues.map(v => { return v === null ? 'NULL' : `'${v}'`; }).join(', ');
        try {
            await client.query(`INSERT INTO ${table} (${bodykeys.join(', ')}) VALUES (${VALUES})`);
            console.info(`Created ${table}: ${JSON.stringify(body)}`);
        }
        catch (err) {
            client.guilds.cache.get('771906593386135562').channels.cache.get('1093561649484546130').send({ content: `<@&132946883134881792> ${err}` });
            console.error(`Error creating ${table}: ${err}`);
        }
    };
}