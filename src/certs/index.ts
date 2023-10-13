import fs from 'node:fs';
import path from 'node:path';

export const TLS_CERT = fs.readFileSync(
  path.resolve(__dirname, './trade.valorem.xyz.pem'),
);

export const CA = fs.readFileSync(path.resolve(__dirname, './gdroot-g2.crt'));
