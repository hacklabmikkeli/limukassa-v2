const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const dataDir = path.resolve(`${process.cwd()}${path.sep}`);
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
const config = require('./config.json');
const {getData, createData, delData, setData} = require('./utils/db');
const {readCard} = require("./test");

// set out templating engine.
app.engine('ejs', ejs.renderFile);
app.set('view engine', 'ejs');

// initialize body-parser middleware to be able to read forms.
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    }),
);
const renderTemplate = (res, req, template, data = {}) => {
    // Default base data which passed to the ejs template by default.
    const baseData = {
        path: req.path,
    };
    // render template using the absolute path of the template and the merged default data with the additional data provided.
    res.render(
        path.resolve(`${templateDir}${path.sep}${template}`),
        Object.assign(baseData, data),
    );
};
app.use('/', express.static(path.resolve(`${dataDir}${path.sep}static`), {
    extensions: ['html'],
}));

app.get('/', async (req, res) => renderTemplate(res, req, 'index.ejs', {user: await getData("users", {id: req.query.user}, {nocreate: true})}));

app.get('/users', async (req, res) => renderTemplate(res, req, 'users.ejs', {"users": await getData("users", {}, {all: true})}));
app.get("/card/:id", async (req, res) => renderTemplate(res, req, 'card.ejs', {user: await getData("users", {id: req.params.id}, {nocreate: true})}))
app.get('/test', async (req, res) => renderTemplate(res, req, 'shop.ejs', {user: await getData("users", {id: req.query.user}, {nocreate: true})}));
app.get('/main', async (req, res) => renderTemplate(res, req, 'main.ejs', {}));

app.get('/menu', async (req, res) => renderTemplate(res, req, 'menu.ejs', {}));

app.get('/shop', async (req, res) => renderTemplate(res, req, 'shop.ejs', {}));

app.get('/balance', async (req, res) => renderTemplate(res, req, 'balance.ejs', {}));

app.get('/pay', async (req, res) => renderTemplate(res, req, 'pay.ejs', {}));


app.get('/api/reader', async (req, res) => {
    await readCard().then(async (uid) => {
        if(uid.error !== undefined) {
            res.json(uid)
            return
        }
        await getData("users", {}, {nocreate: true, all: true}).then(async (users) => {
            user = users.filter(user => user.cards.includes(uid.uid))
            data = {user: user, uid: uid.uid}
            res.json(data)
            return
        })
    })
})

app.get('/api/updateData/:id', async (req, res) => {
    await getData("users", {id: req.params.id}, {nocreate: true, all: true}).then(async (user) => {
        res.json(user)
        return
    })
})

app.post("/card/:id/add", async (req, res) => {
    if(req.params.id === undefined) res.sendStatus(400)
    let user = await getData("users", {id: req.params.id}, {nocreate: true})
    if(user === undefined) res.sendStatus(400)
    if(req.body.card === undefined) res.sendStatus(400)
    if(req.body.card === "") res.sendStatus(400)
    await setData("users", {id: user.id}, {card: req.body.card}).then(() => {
        res.redirect("/card/"+user.id)
    })
})


app.post("/api/user/add", async (req, res) => {
    if(req.body.username === undefined) res.sendStatus(400)
    if(req.body.username === "") res.sendStatus(400)
    await createData("users",{ name: req.body.username, balance: 0 }).then(() => {
        res.redirect("/users")
    });
})
app.post("/api/transaction", async (req, res) => {
    if(req.body.amount === undefined) return res.sendStatus(400)
    if(req.body.user === undefined) return res.sendStatus(400)
    user = await getData("users", {id: req.body.user}, {nocreate: true})
    if(user === undefined) res.sendStatus(400)
    await setData("users", {id: user.id}, {balance: parseInt(user.balance) - parseInt(req.body.amount)}).then(() => {
      res.redirect("/menu")
    })
})
app.post("/api/addMoney", async (req, res) => {
    if(req.body.amount === undefined) return res.sendStatus(400)
    if(req.body.user === undefined) return res.sendStatus(400)
    user = await getData("users", {id: req.body.user}, {nocreate: true})
    if(user === undefined) return res.sendStatus(400)
    await setData("users", {id: user.id}, {balance: parseInt(user.balance) + parseInt(req.body.amount)}).then(() => {
        return res.redirect("/menu")
    })
})
/*
app.post("/api/user/del", async (req, res) => {
    if(req.body.name == undefined) res.sendStatus(400)
    if(req.body.name == "") res.sendStatus(400)
    await delData("users",{ name: req.body.name }).then(() => {
        res.redirect("/users")
    });
})*/
app.all('*', (req, res) => {
    renderTemplate(res, req, 'errors/404.ejs')
})

app.listen(config.port, config.bind_ip, null, null, () => {
    console.log(`running on port ${config.port}.`);

});
