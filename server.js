const express = require('express');
const cors = require('cors');
const matchesHandler = require('./api/matches'); // Importás la función

const app = express();
app.use(cors());

app.get('/api/matches', matchesHandler);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor local corriendo en http://localhost:${PORT}`);
});
