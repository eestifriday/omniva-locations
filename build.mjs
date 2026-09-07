import { writeFile } from 'node:fs/promises';

const res = await fetch('https://www.omniva.ee/locationsfull.json', {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Accept': 'application/json',
  },
});
if (!res.ok) throw new Error(`Omniva vastas ${res.status}`);

const all = await res.json();
if (!Array.isArray(all) || all.length < 100) {
  throw new Error('Kahtlaselt vähe kirjeid, ei kirjuta üle');
}

const locations = all
  .filter(l => l.A0_NAME === 'EE' && l.TYPE === '0')
  .map(l => ({
    zip: l.ZIP,                // Omniva saadetistes on see automaadi ID
    name: l.NAME,
    county: l.A1_NAME,
    city: l.A2_NAME,
    address: `${l.A5_NAME} ${l.A7_NAME}`.trim() || l.A6_NAME,
    lat: +l.Y_COORDINATE,
    lng: +l.X_COORDINATE,
  }))
  .sort((a, b) =>
    a.county.localeCompare(b.county, 'et') || a.name.localeCompare(b.name, 'et')
  );

const payload = { updated: new Date().toISOString(), locations };

await writeFile('omniva-ee.json', JSON.stringify(payload));
await writeFile('omniva-ee.js', `window.omnivaEE = ${JSON.stringify(payload)};\n`);

console.log(`${locations.length} pakiautomaati kirjutatud`);
