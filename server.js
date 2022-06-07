const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.static('frontend/dist/frontend'))
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.set('trust proxy', true);

app.get('/', (req, res) => {
    res.sendFile('index');
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});