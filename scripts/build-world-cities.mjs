import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { unzipSync } from 'fflate';

export const GEONAMES_URL = 'https://download.geonames.org/export/dump/cities15000.zip';

const isUsefulAlias = (alias) => {
  if (!alias || alias.length > 80) return false;
  return /\p{Script=Latin}|\p{Script=Hangul}/u.test(alias);
};

export function parseGeoNames(text) {
  const seen = new Set();
  const cities = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields = line.split('\t');
    const id = fields[0]?.trim();
    const name = fields[1]?.trim();
    const asciiName = fields[2]?.trim() || name;
    const latitude = Number(fields[4]);
    const longitude = Number(fields[5]);
    const countryCode = fields[8]?.trim().toUpperCase();
    const population = Number(fields[14]) || 0;
    const timeZone = fields[17]?.trim();
    if (!id || !name || !countryCode || !timeZone || seen.has(id)) continue;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) continue;
    if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;

    const canonical = new Set([name.toLocaleLowerCase(), asciiName.toLocaleLowerCase()]);
    const aliases = [];
    for (const rawAlias of (fields[3] ?? '').split(',')) {
      const alias = rawAlias.trim();
      const normalized = alias.toLocaleLowerCase();
      if (!isUsefulAlias(alias) || canonical.has(normalized)) continue;
      canonical.add(normalized);
      aliases.push(alias);
      if (aliases.length === 8) break;
    }

    seen.add(id);
    cities.push([id, name, asciiName, aliases, countryCode, latitude, longitude, timeZone, population]);
  }

  return cities.sort((left, right) => right[8] - left[8] || left[0].localeCompare(right[0]));
}

export async function buildWorldCities({ sourceUrl = GEONAMES_URL, outputPath } = {}) {
  const response = await fetch(sourceUrl, { headers: { 'User-Agent': 'Jansang-Star-City-Builder/1.0' } });
  if (!response.ok) throw new Error(`GeoNames download failed: ${response.status} ${response.statusText}`);
  const archive = unzipSync(new Uint8Array(await response.arrayBuffer()));
  const entry = archive['cities15000.txt'];
  if (!entry) throw new Error('cities15000.txt is missing from the GeoNames archive');
  const cities = parseGeoNames(new TextDecoder().decode(entry));
  if (cities.length < 20_000) throw new Error(`GeoNames city count is unexpectedly low: ${cities.length}`);

  const destination = outputPath ?? resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'data', 'world-cities.json');
  await mkdir(dirname(destination), { recursive: true });
  const payload = JSON.stringify({
    source: 'GeoNames cities15000',
    sourceUrl,
    license: 'CC BY 4.0',
    generatedAt: new Date().toISOString(),
    cities,
  });
  if (Buffer.byteLength(payload) > 10_000_000) throw new Error(`World-city asset exceeds 10 MB: ${Buffer.byteLength(payload)}`);
  await writeFile(destination, payload);
  return { destination, bytes: Buffer.byteLength(payload), count: cities.length };
}

const invokedPath = process.argv[1] ? pathToFileURL(resolve(process.argv[1])).href : '';
if (invokedPath === import.meta.url) {
  const result = await buildWorldCities();
  process.stdout.write(`Generated ${result.count} cities (${result.bytes} bytes) at ${result.destination}\n`);
}
