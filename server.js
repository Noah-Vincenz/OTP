const express = require("express");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");


const accountSid = "..."; // TODO: insert credentials here
const authToken = "..."; // TODO: insert credentials here
const client = require("twilio")(accountSid, authToken);

const app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

var transporter = nodemailer.createTransport({
    pool: true, // otherwise we would connect to the SMTP server separately for every single message
    host: "...", // TODO: insert credentials here
    port: 465,
    secure: true, // use TLS
    auth: {
        user: "...", // TODO: insert credentials here
        pass: "...", // TODO: insert credentials here
    },
});

app.get("/api/status", (req, res) => {
    console.log("GET /api/status request has been received. Status is: healthy");
    res.json({
        msg: "Status is: healthy"
    });
});

app.post("/api/send-text-message", (req, res) => {
    console.log("POST /api/send-text-message request has been received");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const {fromNumber, toNumber} = req.body;
    client.messages
        .create({
            from: fromNumber, // TODO: insert twilio phone number here ie '+13...'
            to: toNumber,
            body: `Your naturAlly one-time password is ${randomNum}`,
        })
        .then((message) => {
            console.log('mobile text message sent successfully');
            res.json({
                msg: `mobile text message sent successfully with OTP ${randomNum}`,
                data: message
            });
        })
        .catch((err) => {
            console.log("error", err);
            res.json({
                error: err,
            })
        });
});

app.post("/api/send-email", (req, res) => {
    console.log("POST /api/send-email request has been received");
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    var mailOptions = {
        from: "...", // TODO: insert email host here
        to: req.body.toEmail,
        subject: "Your naturAlly OTP",
        html: `<p style="font-size:16px;">Your naturAlly one-time password is ${randomNum}</p><br><br><br>
    <img src="cid:unique@nodemailer.com"/><br>
    <p style="font-size:9px;">Some Footer<br><br>
    Another footer.</p>`,
        attachments: [{
            filename: 'logo.png',
            path: 'naturally-logo.png',
            cid: 'unique@nodemailer.com' //same cid value as in the html img src
        }]
    };
    transporter.sendMail(mailOptions, (err, result) => {
        if (err) {
            return res.json({
                msg: "error",
                error: err,
            });
        } else {
            console.log('email sent successfully');
            res.json({
                msg: `email sent successfully with OTP ${randomNum}`,
                data: result,
            });
        }
    });
});

app.listen(3001, () =>
    console.log("Express server is running on localhost:3001")
);
