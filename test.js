"use strict";
const Mfrc522 = require("mfrc522-rpi");
const SoftSPI = require("rpi-softspi");
const config = require("./config.json");
//# This loop keeps checking for chips. If one is near it will get the UID and authenticate
console.log("scanning...");
console.log("Please put chip or keycard in the antenna inductive zone!");
console.log("Press Ctrl-C to stop.");

const softSPI = new SoftSPI({
    clock: 23, // pin number of SCLK
    mosi: 19, // pin number of MOSI
    miso: 21, // pin number of MISO
    client: 24 // pin number of CS
});

// GPIO 24 can be used for buzzer bin (PIN 18), Reset pin is (PIN 22).
// I believe that channing pattern is better for configuring pins which are optional methods to use.
const mfrc522 = new Mfrc522(softSPI).setResetPin(22).setBuzzerPin(18);
/*
setInterval(function() {
    //# reset card
    mfrc522.reset();

    //# Scan for cards
    let response = mfrc522.findCard();
    if (!response.status) {
        console.log("No Card");
        return;
    }
    console.log("Card detected, CardType: " + response.bitSize);

    //# Get the UID of the card
    response = mfrc522.getUid();
    if (!response.status) {
        console.log("UID Scan Error");
        return;
    }
    //# If we have the UID, continue
    const uid = response.data;
    console.log(
        "Card read UID: %s %s %s %s",
        uid[0].toString(16),
        uid[1].toString(16),
        uid[2].toString(16),
        uid[3].toString(16),
    );

    //# Stop
    mfrc522.stopCrypto();
}, 500);*/

async function readCard() {
    return new Promise((resolve, reject) => {
        mfrc522.reset();
        let uid;
        let success = false;
        let tryCount = 0;
        let readInterval = setInterval(function() {
            mfrc522.reset();
            let response = mfrc522.findCard();
            tryCount += 1
            console.log(tryCount)
            if(tryCount > config.max_tries) {
                clearInterval(readInterval);
                reject("Not able to read card")
            }
            if (!response.status) {
                console.log("No Card");
                reject("Not able to read card")
            }
            response = mfrc522.getUid();
            if (!response.status) {
                console.log("UID Scan Error");
                reject("Not able to read card")
            }
            uid = response.data;
            console.log(
                "Card read UID: %s %s %s %s",
                uid[0].toString(16),
                uid[1].toString(16),
                uid[2].toString(16),
                uid[3].toString(16),
            );
            success = true
            mfrc522.stopCrypto();
            if(success) {
                clearInterval(readInterval);
                resolve(uid)
            }
            mfrc522.stopCrypto();
        }, 500);
    })
}

//await readCard();

module.exports = {
    readCard
}