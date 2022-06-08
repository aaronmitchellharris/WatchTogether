const cors = require('cors');
const path = require('path');

const PORT = process.env.PORT || 8081;
const ws_PORT = process.env.ws_PORT || 8080;

// create website server
const express = require('express');
const app = express();

// create websocket server
const ws = require('ws')
const wss = new ws.Server({ port: ws_PORT });

app.use(cors());
app.use(express.static('frontend/dist/frontend'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

// handle websocket connections
wss.on('connection', socket => {
    console.log('Connection made...');
    socket.on('message', (data, isBinary) => {
        wss.clients.forEach(client => {
            if (client != ws && client.readyState === ws.OPEN) {
                client.send(data, { binary: isBinary });
                console.log(data);
            }
        })
    })
});

// use angular for frontend
app.get('/', (req, res) => {
    res.sendFile('index');
});

const server = app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
})
