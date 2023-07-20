import dotenv from 'dotenv'
import express from "express"
import { google } from 'googleapis'
import dayjs from 'dayjs'
import {v4 as uuid} from 'uuid'


dotenv.config({})

const calendar = google.calendar({
    version: "v3",
    auth: process.env.API_KEY
})

const app = express()

const PORT = process.env.NODE_EVN || 8000;

const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
)


// generate a url that asks permissions for Google Calendar scopes
const scopes = ['https://www.googleapis.com/auth/calendar'];

app.get("/google", (req, res) => {
    const url = oauth2Client.generateAuthUrl({
        // 'online' (default) or 'offline' (gets refresh_token)
        access_type: 'offline',
      
        // If you only need one scope you can pass it as a string
        scope: scopes
    });
    res.redirect(url);
})

app.get("/google/redirect", async (req, res) => {
    const code = req.query.code;
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);
    
    res.send({
        msg: "You have successfully logged in",
    })
})




app.get('/schedule_event', async (req, res) => {

    const customDateTime = "2023-07-21 22:00:00"
    const event = {
        summary: "Meeting made from Node JS code using a Google Calendar API",
        description: "This event is for testing.",
        start: {
            dateTime: dayjs(customDateTime).toISOString(),
            timezone: "Asia/Ho_Chi_Minh"
        },
        end: {
            dateTime: dayjs(customDateTime).add(1, 'hour').toISOString(),
            timezone: "Asia/Ho_Chi_Minh"
        },
        conferenceData: {
          createRequest: {
            requestId: uuid(),
          },
        },
        attendees: [
            { email: 'auroranguyen259@gmail.com' }, 
            { email: 'kietdng2@gmail.com' },
            { email: 'lamhuynh2207@gmail.com' },
            { email: 'dinhhoanganh2001@gmail.com' }, 
            { email: 'pntphamnnguyenthao@gmail.com' },
            { email: "truongtrinhkhaidng@gmail.com" },
        ],
        
    };

    try {
        const response =  await calendar.events.insert({
            calendarId: "primary",
            auth: oauth2Client,
            conferenceDataVersion: 1,
            requestBody : event,
            sendUpdates: "all"
        });

        res.send({
            msg: 'Done',
        });
    } catch (error) {
        console.log('Error creating event:', error.message);
        res.status(500).send({
          error: 'Failed to create event.',
        });
    }
})

app.listen(PORT, () => {
    console.log("Server started on port ", PORT);
});