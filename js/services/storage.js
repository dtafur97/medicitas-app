// Servicio central de acceso a datos. Encapsula localStorage para todas las
// entidades del sistema. Se auto-inicializa con datos semilla si están vacías.

import { generateSeed } from '../data/seed.js';
import { nextId } from '../utils/codes.js';

const PREFIX = 'medicitas_';
const SEED_FLAG_KEY = `${PREFIX}seeded`;
const ENTITIES = ['usuarios', 'especialidades', 'medicos', 'horarios', 'citas', 'historiales', 'notificaciones'];

function keyFor(entity) {
  return `${PREFIX}${entity}`;
}

function readAll(entity) {
  const raw = localStorage.getItem(keyFor(entity));
  return raw ? JSON.parse(raw) : [];
}

function writeAll(entity, arr) {
  localStorage.setItem(keyFor(entity), JSON.stringify(arr));
}

function seedIfNeeded() {
  const seeded = localStorage.getItem(SEED_FLAG_KEY);
  if (seeded === 'true') return;
  const data = generateSeed();
  for (const entity of ENTITIES) {
    writeAll(entity, data[entity] || []);
  }
  localStorage.setItem(SEED_FLAG_KEY, 'true');
}

// Se ejecuta automáticamente al importar este módulo en cualquier página.
seedIfNeeded();

export function getAll(entity, filterFn) {
  const all = readAll(entity);
  return typeof filterFn === 'function' ? all.filter(filterFn) : all;
}

export function getById(entity, id) {
  const all = readAll(entity);
  return all.find((item) => item.id === Number(id)) || null;
}

export function create(entity, obj) {
  const all = readAll(entity);
  const id = nextId(all);
  const record = { id, ...obj };
  all.push(record);
  writeAll(entity, all);
  return record;
}

export function update(entity, id, patch) {
  const all = readAll(entity);
  const idx = all.findIndex((item) => item.id === Number(id));
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, id: all[idx].id };
  writeAll(entity, all);
  return all[idx];
}

export function remove(entity, id) {
  const all = readAll(entity);
  const filtered = all.filter((item) => item.id !== Number(id));
  writeAll(entity, filtered);
  return filtered.length !== all.length;
}

export function resetData() {
  localStorage.removeItem(SEED_FLAG_KEY);
  for (const entity of ENTITIES) {
    localStorage.removeItem(keyFor(entity));
  }
  seedIfNeeded();
}
