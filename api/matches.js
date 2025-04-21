// const express = require('express');
// const axios = require('axios');
// const { DateTime } = require('luxon');
// const cors = require('cors');

// const app = express();
// const PORT = 3000;
// app.use(cors());

// const FOOTBALL_API_KEY = '281755bf5604412f86a0dae56d60eb0a'; // <-- reemplazá esto con tu API Key de football-data.org

// // Ruta principal
// app.get('/api/matches', async (req, res) => {
//   try {
//     // 1. Obtener IP del usuario
//     const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//     console.log(ip)
//     // 2. Obtener zona horaria desde ip-api
//     const ipResponse = await axios.get(`http://ip-api.com/json/${ip}`);
//     console.log(ipResponse)
//     const timezone = ipResponse.data.timezone || 'UTC';
//     console.log(timezone)
//     // 3. Obtener partidos desde football-data (ejemplo: Premier League)
//     const matchesResponse = await axios.get(
//       'https://api.football-data.org/v4/competitions/PL/matches',
//       {
//         headers: {
//           'X-Auth-Token': FOOTBALL_API_KEY
//         }
//       }
//     );

//     const now = DateTime.now().toUTC();
//     console.log(now)
//     // 4. Procesar partidos futuros y convertir fechas
//     const matches = matchesResponse.data.matches
//       .filter(match => DateTime.fromISO(match.utcDate) > now)
//       .slice(0, 5) // mostrar los próximos 5
//       .map(match => {
//         const utcTime = DateTime.fromISO(match.utcDate, { zone: 'utc' });
//         const localTime = utcTime.setZone(timezone);

//         return {
//           homeTeam: match.homeTeam.name,
//           awayTeam: match.awayTeam.name,
//           stadium: match.venue || 'Estadio no especificado',
//           utcKickoff: utcTime.toFormat('yyyy-LL-dd HH:mm'),
//           localKickoff: localTime.toFormat('yyyy-LL-dd HH:mm'),
//         };
//       });

//     res.json({
//       timezone,
//       matches
//     });

//   } catch (error) {
//     console.error('Error:', error.message);
//     res.status(500).json({ error: 'Hubo un error al procesar la solicitud.' });
//   }
// });

// app.listen(PORT, () => {
//   console.log('Servidor escuchando en http://localhost:${PORT}');
// });

const axios = require('axios');
const { DateTime } = require('luxon');

const FOOTBALL_API_KEY = '281755bf5604412f86a0dae56d60eb0a';

module.exports = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const ipResponse = await axios.get(`http://ip-api.com/json/${ip}`);
    const timezone = ipResponse.data.timezone || 'UTC';

    const matchesResponse = await axios.get(
      'https://api.football-data.org/v4/competitions/PL/matches',
      {
        headers: {
          'X-Auth-Token': FOOTBALL_API_KEY
        }
      }
    );

    const now = DateTime.now().toUTC();

    const matches = matchesResponse.data.matches
      .filter(match => DateTime.fromISO(match.utcDate) > now)
      .slice(0, 10)
      .map(match => {
        const utcTime = DateTime.fromISO(match.utcDate, { zone: 'utc' });
        const localTime = utcTime.setZone(timezone);

        return {
          homeTeam: match.homeTeam.name,
          awayTeam: match.awayTeam.name,
          // stadium: match.venue || 'Estadio no especificado',
          utcKickoff: utcTime.toFormat('yyyy-LL-dd HH:mm'),
          localKickoff: localTime.toFormat('yyyy-LL-dd HH:mm'),
        };
      });

    res.status(200).json({ timezone, matches });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};