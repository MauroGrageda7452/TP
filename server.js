const express = require('express');
const cors = require('cors');
const matchesHandler = require('./api/matches'); // Importás la función

const app = express();
app.use(cors());

app.get('/api/matches', matchesHandler);

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor local corriendo en http://localhost:${PORT}`);
});
