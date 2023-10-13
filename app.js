const ejs = require('ejs');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const dataDir = path.resolve(`${process.cwd()}${path.sep}`);
const templateDir = path.resolve(`${dataDir}${path.sep}templates`);
const config = require('./config.json');

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
app.all('*', (req, res) => {
    renderTemplate(res, req, 'errors/404.ejs')
})

app.listen(config.port, config.bind_ip, null, null, () => {
    console.log(`running on port ${config.port}.`);

});
