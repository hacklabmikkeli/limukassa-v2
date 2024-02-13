const escpos = require('escpos');
const {getData} = require("./utils/db");
escpos.USB = require('escpos-usb');
const usbDevice = new escpos.USB(0x0483, 0x5743);
const devices = escpos.USB.findPrinter();
const path = require('path');
const hlmLogo = path.join(__dirname, 'hlm.png');

const options = {encoding: "GB18030"}
const printer = new escpos.Printer(usbDevice, options);

function print(users) {
    console.log("Printing")
    usbDevice.open(function(error) {
        escpos.Image.load(hlmLogo, function (image) {
            printer.align('ct')
                .image(image, 's8')
                .then(() => {
                    printer.close()
                })
            let date = new Date()
            let today = date.toLocaleString('fi', {timeZone: "Europe/Helsinki"});
            printer.feed(2).align('CT').style('A').text(today)
            users.forEach((user) => {
                let balance = parseFloat(user.balance).toString()
                let name = user.name
                let spaces = space(balance, name)
                let printingText = name + spaces + balance
                printer.align('CT').style('B').size(1).text(printingText)
            })
            printer
                .align('CT').style('NORMAL').size(1)
                .text('******************************************')
                .feed(2)
                .cut()
                .close()
        })
    })
}
function printDept() {
    getData("users", {}, {nocreate: true, all: true}).then(async (users) => {
        print(users)
    })
    return;
}

exports = {
    printDept

}
function space(str, leading) {
    let spaces = "                                          "
    return spaces.substring(0, 42 - leading.length - str.length)
}