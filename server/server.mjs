import express from 'express';
import cors from 'cors';
import * as dotenv from "dotenv";
dotenv.config();

import membersRoute from './routes/members.mjs';

const app = express();
const port = process.env.SERVER_PORT || 3000;
const hostname = process.env.SERVER_HOSTNAME || 'localhost';

// Whitelist definieren für zugriff später nur client-url
let corsOptions = {
    origin: "*",
    credentials: true,
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
};

app.use(cors(corsOptions));
app.use(express.json());
// Für Built in Middleware für Formulardaten
app.use(express.urlencoded({extended: true}));

app.get('/',  function (req, res) {
    res.send('Hello World!')
})

app.use('/members', membersRoute);

app.use((req, res) => {
    res.status(404).send('Route not found! Check your URL!');
});

app.listen(port, hostname,() => {
    console.log(`Server running at http://${hostname}:${port}/`)
    console.log(`Server started on port ${port}`);
});

export {app};