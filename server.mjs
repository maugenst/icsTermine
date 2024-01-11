import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import process from 'node:process';
import bodyParser from 'body-parser';
import { handler } from './build/handler.js';
//import open from 'open';
import nodemailer from 'nodemailer';
import ics from 'ics';
import dayjs from 'dayjs';
import 'dayjs/locale/de.js';
import utc from 'dayjs/plugin/utc.js';
dayjs.locale(   'de');
dayjs.extend(utc);
import config from 'config';
import fse from 'fs-extra';
const packageJson = fse.readJsonSync('package.json');

const app = express();

app.use(bodyParser.json());

app.get('/healthcheck', (req, res) => {
    res.send('ok');
});

app.get('/version', (req, res) => {
    res.send(packageJson.version);
});

app.post('/api/createICAL', async (req, res) => {
    let filePath = '';
    let fileName = 'KrankengymnastikTermine.ics';
    const body = req.body;

    const events = [];
    body.termine.forEach(termin => {
        const dStart = dayjs(termin.date).utc().subtract(1, 'h');
        const dEnd = dayjs(termin.date).utc().add(body.behandlungsdauer, 'm').subtract(1, 'h');
        const start = [dStart.year(), dStart.month()+1, dStart.date(), dStart.hour(), dStart.minute()];
        const end = [dEnd.year(), dEnd.month()+1, dEnd.date(), dEnd.hour(), dEnd.minute()];
        events.push({
            title: 'Termin Krankengymnastik',
            start,
            end,
            startInputType: 'utc',
            startOutputType: 'utc',
            location: 'PhysioCity Walldorf, Johann-Jakob-Astor-Straße 7, 69190 Walldorf',
            // replace all tabs and newlines with nothing
            htmlContent: config.get('termine.content').replace(/[\n\t]/g, ''),
            url: 'http://www.physiocity-walldorf.de/',
            busyStatus: 'OOF',
            classification: 'PRIVATE',
            organizer: { name: 'PhysioCity-Walldorf', email: config.get('email.auth.username'), sentBy: config.get('email.auth.username') },
            categories: ['Krankengymnastik'],
            alarms: [{ action: 'display', description: 'Terminerinnerung', trigger: { hours: 1, before: true } }]
        })
    });

    const { error, value } = ics.createEvents(events)

    if (error) {
        console.log(error)
        return
    }

    try {
        filePath = path.join(process.cwd(), fileName);
        await fs.writeFile(filePath, value);
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }

    const transporter = nodemailer.createTransport({
        host: config.get('email.server.hostname'),
        port: config.get('email.server.port'),
        secure: true,
        auth: {
            user: config.get('email.auth.username'),
            pass: config.get('email.auth.password')
        }
    });


    // send mail with defined transport object
    await transporter.sendMail({
        from: `"PhysioCity-Walldorf" <${config.get('email.auth.username')}>`,
        to: body.email,
        replyTo: config.get('email.server.replyTo'),
        subject: `Krankengymnastik Termin${body.termine.length>1 ? 'e':''}`,
        html: config.get('email.content'),
        attachments: [{
            filename: fileName,
            path: filePath
        }]
    });

    await transporter.sendMail({
        from: `"PhysioCity-Walldorf" <${config.get('email.auth.username')}>`,
        to: config.get('email.server.replyTo'),
        replyTo: config.get('email.server.replyTo'),
        subject: `Krankengymnastik Termin${body.termine.length>1 ? 'e':''} gesendet an ${body.email}`,
        html: config.get('email.copyContent').replace(/%PATIENTENNAME%/g, body.email),
        attachments: [{
            filename: fileName,
            path: filePath
        }]
    })

    console.log(`Termine gesendet an: ${body.email} and ${config.get('email.server.replyTo')}`);
});

app.use(handler);
const port = config.get('app.server.port');
app.listen(port, async () => {
    console.log(`KalenderApp is running on port ${port}...`);
    //console.log(`Starting browser window: ${url}`)
    //await open(url);
});


