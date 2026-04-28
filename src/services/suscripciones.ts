// Servicio para interactuar con el backend Google Apps Script
// de gestión de suscripciones (API Keys)

const GAS_URL   = import.meta.env.VITE_GAS_URL   as string;
const ADMIN_SEC = import.meta.env.VITE_ADMIN_SECRET as string;

// ─── Interfaces ────────────────────────────────────────────────────────────

export interface Clave {
  clave:  string;
  nombre: string;
  email:  string;
  estado: 'Activa' | 'Inactiva' | 'Disponible';
  vence:  string;
}

export interface ListarClavesResponse {
  ok:          boolean;
  total:       number;
  activas:     number;
  inactivas:   number;
  disponibles: number;
  claves:      Clave[];
}

export interface ClaveDisponibleResponse {
  ok:    boolean;
  clave: string;
  fila:  number;
  error?: string;
}

export interface ActivarClaveParams {
  clave:  string;
  nombre: string;
  email:  string;
  meses:  number;
}

export interface ActivarClaveResponse {
  ok:           boolean;
  clave:        string;
  nombre:       string;
  email:        string;
  vencimiento:  string;
  diasOtorgados:number;
  error?:       string;
}

export interface DesactivarClaveResponse {
  ok:      boolean;
  clave:   string;
  mensaje: string;
  error?:  string;
}

export interface ConsultarClaveResponse {
  ok:     boolean;
  numero: number;
  clave:  string;
  nombre: string;
  email:  string;
  estado: string;
  alta:   string;
  vence:  string;
  meses:  number;
  error?: string;
}

// ─── Helper ────────────────────────────────────────────────────────────────

function buildUrl(params: Record<string, string | number>): string {
  if (!GAS_URL) throw new Error('VITE_GAS_URL no está configurada en .env');
  if (!ADMIN_SEC) throw new Error('VITE_ADMIN_SECRET no está configurada en .env');

  const qs = new URLSearchParams({
    adminSecret: ADMIN_SEC,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])),
  });
  return `${GAS_URL}?${qs.toString()}`;
}

async function gasGet<T>(params: Record<string, string | number>): Promise<T> {
  const url = buildUrl(params);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Error HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as T;
}

// ─── Funciones exportadas ──────────────────────────────────────────────────

export async function listarClaves(): Promise<ListarClavesResponse> {
  return gasGet<ListarClavesResponse>({ accion: 'listarClaves' });
}

export async function obtenerClaveDisponible(): Promise<ClaveDisponibleResponse> {
  const data = await gasGet<ClaveDisponibleResponse>({ accion: 'claveDisponible' });
  if (!data.ok) throw new Error(data.error || 'No hay claves disponibles');
  return data;
}

export async function activarClave(p: ActivarClaveParams): Promise<ActivarClaveResponse> {
  const data = await gasGet<ActivarClaveResponse>({
    accion:  'activarClave',
    clave:   p.clave,
    nombre:  p.nombre,
    email:   p.email,
    meses:   p.meses,
  });
  if (!data.ok) throw new Error(data.error || 'No se pudo activar la clave');
  return data;
}

export async function desactivarClave(clave: string): Promise<DesactivarClaveResponse> {
  const data = await gasGet<DesactivarClaveResponse>({ accion: 'desactivarClave', clave });
  if (!data.ok) throw new Error(data.error || 'No se pudo desactivar la clave');
  return data;
}

export async function consultarClave(clave: string): Promise<ConsultarClaveResponse> {
  const data = await gasGet<ConsultarClaveResponse>({ accion: 'consultarClave', clave });
  if (!data.ok) throw new Error(data.error || 'Clave no encontrada');
  return data;
}
