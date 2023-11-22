import express from 'express';
import { promises as fs } from 'fs';
import path from 'path';
import bodyParser from 'body-parser';
import { handler } from './build/handler.js';
import open from 'open';
import nodemailer from 'nodemailer';
import ics from 'ics';
import dayjs from 'dayjs';
import 'dayjs/locale/de.js';
dayjs.locale('de');
import getport from 'getport';

const app = express();

app.use(bodyParser.json());

app.post('/api/createICAL', async (req, res) => {
    let filePath = '';
    let fileName = 'KrankengymnastikTermine.ics';
    const termineUndEmail = req.body;

    const events = [];
    termineUndEmail.termine.forEach(termin => {
        const dStart = dayjs(termin.date);
        const dEnd = dayjs(termin.date).add(30, 'm');
        const start = [dStart.year(), dStart.month()+1, dStart.date(), dStart.hour(), dStart.minute()];
        const end = [dEnd.year(), dEnd.month()+1, dEnd.date(), dEnd.hour(), dEnd.minute()];
        events.push({
            title: 'Termin Krankengymnastik',
            start,
            end,
            location: 'PhysioCity Walldorf, Johann-Jakob-Astor-Straße 7, 69190 Walldorf',
            htmlContent: `<!DOCTYPE html><html><body style="font-family: Arial"><p>Sehr geehrte(r) PatientIn.<br><br>Gerne begrüßen wir Sie am ${termin.date} in unserer Praxis zur Behandlung.<br><br>Mit freundlichen Grüßen,<br>Ihr PhysioCity-Team<br><img src="https://www.physiocity-walldorf.de/.cm4all/mediadb/Zeichenfl%C3%A4che%201.png" width="200" height="200"></p></body></html>`,
            url: 'http://www.physiocity-walldorf.de/',
            busyStatus: 'OOF',
            classification: 'PRIVATE',
            organizer: { name: 'PhysioCity-Walldorf', email: 'info@physiocity-walldorf.de', sentBy: 'info@physiocity-walldorf.de' },
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
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: '<username>',
            pass: '<password>'
        }
    });


    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"PhysioCity-Walldorf" <info@physiocity-walldorf.de>', // sender address
        to: termineUndEmail.email, // list of receivers
        subject: `Krankengymnastik Termin${termineUndEmail.termine.length>1 ? 'e':''}`,
        html: '<!DOCTYPE html><html><body style="font-family: Arial">' +
            '<p>Sehr geehrte(r) PatientIn.<br><br>' +
            'Wie gerade in der Praxis besprochen finden Sie im Anhang eine Termin Datei, in welcher Ihre Termine zum Import in Ihrem Handy oder am PC, gespeichert sind.<br><br>' +
            'Mit freundlichen Grüßen,<br>' +
            'Ihr PhysioCity-Team</p></body></html>',
        attachments: [{
            filename: fileName,
            path: filePath
        }]

    });

    console.log(`Termine gesendet an: ${termineUndEmail.email}`);
});

app.use(handler);

getport( 50000, (_,port) => {
    app.listen(port, async () => {
        const url = `http://localhost:${port}`;
        console.log(`KalenderApp is running on port ${port}...`);
        console.log(`Starting browser window: ${url}`)
        await open(url);
    });
});


