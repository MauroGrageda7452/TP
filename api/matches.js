const axios = require('axios');
const { DateTime } = require('luxon');

const FOOTBALL_API_KEY = '281755bf5604412f86a0dae56d60eb0a';

module.exports = async (req, res) => {
  try {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const ipResponse = await axios.get(`http://ip-api.com/json/${ip}`);
    const timezone = ipResponse.data.timezone || 'UTC';
    const country = ipResponse.data.country || 'No disponible';

    const utcOffset = DateTime.now().setZone(timezone).offset / 60;

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
          utcKickoff: utcTime.toFormat('yyyy-LL-dd HH:mm'),
          localKickoff: localTime.toFormat('yyyy-LL-dd HH:mm'),
        };
      });

    res.status(200).json({
      timezone,
      country,
      utcOffset: `UTC ${utcOffset >= 0 ? '+' : ''}${utcOffset}`,
      matches
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
};
