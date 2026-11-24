import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express from 'express';
import type { NextFunction, Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.trim().length >= 16
    ? process.env.SESSION_SECRET.trim()
    : crypto.randomBytes(32).toString('hex');

const DATA_DIR = path.resolve(process.cwd(), 'data');
const STORE_FILE = path.resolve(DATA_DIR, 'store.json');

interface StoredUser {
  id: string;
  username: string;
  fullName: string;
  regional: string;
  centroFormacion: string;
  role: string;
  isAdmin: boolean;
  passwordHash: string;
  createdAt: string;
}

interface StoredStore {
  users: StoredUser[];
  projects: Record<string, any>[];
}

interface AuthenticatedRequest extends Request {
  authUser?: {
    id: string;
    username: string;
    fullName: string;
    regional: string;
    centroFormacion: string;
    role: string;
    isAdmin: boolean;
  };
}

function ensureStoreFile(): StoredStore {
  if (!STORE_FILE.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Ruta de almacenamiento inválida.');
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(STORE_FILE)) {
    const initial: StoredStore = { users: [], projects: [] };
    fs.writeFileSync(STORE_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as StoredStore;
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      projects: Array.isArray(parsed.projects) ? parsed.projects : [],
    };
  } catch {
    return { users: [], projects: [] };
  }
}

function saveStore(store: StoredStore): void {
  if (!STORE_FILE.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Ruta de almacenamiento inválida.');
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  const tempFile = path.resolve(DATA_DIR, `store.${process.pid}.${Date.now()}.tmp`);
  if (!tempFile.startsWith(DATA_DIR + path.sep)) {
    throw new Error('Ruta temporal inválida.');
  }
  fs.writeFileSync(tempFile, JSON.stringify(store, null, 2), 'utf8');
  fs.renameSync(tempFile, STORE_FILE);
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(':');
  if (parts.length !== 2) return false;
  const [salt, hashHex] = parts;
  if (!salt || !hashHex) return false;
  try {
    const derived = crypto.scryptSync(password, salt, 64);
    const storedBuf = Buffer.from(hashHex, 'hex');
    if (derived.length !== storedBuf.length) return false;
    return crypto.timingSafeEqual(derived, storedBuf);
  } catch {
    return false;
  }
}

function verifyEnvPasscode(candidate: string): boolean {
  const envPass = process.env.SET_ADMIN_PASSCODE?.trim();
  if (!envPass) return false;
  const h1 = crypto.createHash('sha256').update(candidate).digest();
  const h2 = crypto.createHash('sha256').update(envPass).digest();
  return crypto.timingSafeEqual(h1, h2);
}

function signToken(payload: Record<string, unknown>): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifyToken(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  const sigBuf = Buffer.from(sig, 'utf8');
  const expBuf = Buffer.from(expectedSig, 'utf8');
  if (sigBuf.length !== expBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expBuf)) return null;
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as Record<
      string,
      unknown
    >;
    if (typeof parsed.exp !== 'number' || Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

function sanitizeUser(u: StoredUser) {
  return {
    id: u.id,
    username: u.username,
    fullName: u.fullName,
    regional: u.regional,
    centroFormacion: u.centroFormacion,
    role: u.role,
    createdAt: u.createdAt,
  };
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Sesión requerida. Ingrese con su nombre y clave.' });
    return;
  }
  const token = header.slice(7).trim();
  const payload = verifyToken(token);
  if (!payload || typeof payload.sub !== 'string') {
    res.status(401).json({ error: 'Sesión expirada o inválida. Vuelva a ingresar.' });
    return;
  }
  const store = ensureStoreFile();
  const user = store.users.find((u) => u.id === payload.sub);
  if (!user) {
    res.status(401).json({ error: 'Usuario no encontrado.' });
    return;
  }
  req.authUser = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    regional: user.regional,
    centroFormacion: user.centroFormacion,
    role: user.role,
    isAdmin: user.isAdmin,
  };
  next();
}

function buildStarterProject(user: StoredUser): Record<string, any> {
  const now = new Date().toISOString();
  return {
    id: `set-${crypto.randomUUID().slice(0, 8)}`,
    ownerId: user.id,
    ownerName: user.fullName,
    regional: user.regional,
    centroFormacion: user.centroFormacion,
    vigencia: 2026,
    smmlvValueCOP: 1423500,
    title: `Proyecto Regional SET 2026 — ${user.centroFormacion}`,
    status: 'borrador',
    radicadoCode: null,
    integrityHash: null,
    createdAt: now,
    updatedAt: now,
    lastSavedAt: null,
    finalizedAt: null,
    saveHistory: [],
    etapa1: {
      comiteInstalado: false,
      fechaComite: '',
      actaComiteRef: '',
      agendasCruzadas: {
        crciArCo: false,
        conpes4129: false,
        planTecnologicoCentro: false,
      },
      sectoresPriorizados: '',
      mesasActores: '',
      brechaIdentificada: '',
      filtroElegibilidad: {
        noOfertaRegularNiBasica: false,
        exclusionCajasCompensacion: false,
        noConcurrenciaLineas1y2: false,
      },
    },
    etapa2: {
      comp1Diagnostico: '',
      comp2ObjetivoGeneral: '',
      comp3Experiencias: [],
      comp4Poblacion: {
        totalTrabajadores: 0,
        empresasOrganizaciones: '',
        caracterizacion: '',
        vinculacionVerificada: false,
      },
      comp5Presupuesto: {
        items: [],
        contrapartidaPct: 0,
        gastosOperacionPct: 0,
        transferenciaConocimientoPct: 0,
        notasEstudioMercado: '',
      },
      comp6Indicadores: {
        metaCapacitados: 0,
        metaCertificados: 0,
        eficaciaAcademicaPct: 85,
        metricasAplicacion: '',
      },
      comp7GestionConocimiento: '',
    },
    etapa3: {
      avalRegionalObtenido: false,
      fechaRadicacionDSNFT: '',
      observacionesSubsanadas: false,
      conceptoViabilidadArt19: '',
      actoTrasladoPresupuestal: '',
      montoTrasladadoCOP: 0,
    },
    etapa4: {
      planeacionParalelaIniciada: false,
      cdpExpedidos: [],
      pluralidadOferentesVerificada: false,
      rpsPerfeccionados: [],
    },
    etapa5: {
      convocatoriaCompletada: false,
      sesionesPlaneadas: 0,
      sesionesEjecutadas: 0,
      asistentesVerificados: 0,
      custodiaEvidencias: {
        listadosAsistencia: false,
        evaluaciones: false,
        actasInsumos: false,
        registroFotografico: false,
      },
      reportesDSNFTArt20: '',
    },
    etapa6: {
      constanciasEmitidas: 0,
      liquidacionContractualCompleta: false,
      saldosLiberadosCOP: 0,
      bovedaConocimientoCargada: false,
      enlaceRepositorioDSNFT: '',
      informeFinalResultadosArt21: '',
    },
    juridico: {
      gratuidadAbsolutaArt12: false,
      propiedadIntelectualArt22: false,
      proteccionDatosLey1581Art23: false,
      imagenAusteridadArt24: false,
    },
    auditoriaChecklist: {
      formulacion: {
        checked: false,
        evidencia: '',
        responsable: 'Dir. Regional / Enlace SET',
      },
      pertinencia: {
        checked: false,
        evidencia: '',
        responsable: 'Coordinación Académica',
      },
      presupuesto: {
        checked: false,
        evidencia: '',
        responsable: 'Enlace SET / Presupuesto',
      },
      contratacion: {
        checked: false,
        evidencia: '',
        responsable: 'Subdirector / Contratación',
      },
      ejecucion: {
        checked: false,
        evidencia: '',
        responsable: 'Supervisión / Coord. Acad.',
      },
      juridica: {
        checked: false,
        evidencia: '',
        responsable: 'Apoyo Jurídico / Subdirector',
      },
      cierre: {
        checked: false,
        evidencia: '',
        responsable: 'Subdirector / Enlace SET',
      },
    },
  };
}

function validateProjectForFinalizationServer(project: Record<string, any>) {
  const issues: Array<{ section: string; message: string }> = [];
  const e1 = project.etapa1 || {};
  const e2 = project.etapa2 || {};
  const e3 = project.etapa3 || {};
  const e4 = project.etapa4 || {};
  const e5 = project.etapa5 || {};
  const e6 = project.etapa6 || {};
  const jur = project.juridico || {};
  const audit = project.auditoriaChecklist || {};

  if (!e1.comiteInstalado) {
    issues.push({
      section: 'Etapa 1 · Alistamiento',
      message: 'Debe confirmar la instalación del Comité Técnico Regional SET.',
    });
  }
  const filtro = e1.filtroElegibilidad || {};
  if (
    !filtro.noOfertaRegularNiBasica ||
    !filtro.exclusionCajasCompensacion ||
    !filtro.noConcurrenciaLineas1y2
  ) {
    issues.push({
      section: 'Etapa 1 · Filtro Obligatorio',
      message:
        'Debe aprobar los tres controles de elegibilidad y no duplicidad (pertinencia, exclusión de Cajas y no concurrencia Líneas 1 y 2).',
    });
  }

  if (typeof e2.comp1Diagnostico !== 'string' || e2.comp1Diagnostico.trim().length < 15) {
    issues.push({
      section: 'Etapa 2 · Componente 1',
      message: 'Complete el Diagnóstico de Necesidades de Capacitación.',
    });
  }
  if (typeof e2.comp2ObjetivoGeneral !== 'string' || e2.comp2ObjetivoGeneral.trim().length < 15) {
    issues.push({
      section: 'Etapa 2 · Componente 2',
      message: 'Defina el Objetivo General orientado al cierre de brechas.',
    });
  }
  if (!Array.isArray(e2.comp3Experiencias) || e2.comp3Experiencias.length === 0) {
    issues.push({
      section: 'Etapa 2 · Componente 3',
      message: 'Agregue al menos una Experiencia de Aprendizaje a la medida (Art. 11).',
    });
  }
  const pob = e2.comp4Poblacion || {};
  if (Number(pob.totalTrabajadores) <= 0 || !pob.vinculacionVerificada) {
    issues.push({
      section: 'Etapa 2 · Componente 4',
      message: 'Registre la Población Beneficiaria y verifique su vinculación laboral o productiva.',
    });
  }

  const pres = e2.comp5Presupuesto || {};
  const items = Array.isArray(pres.items) ? pres.items : [];
  const smmlv = Number(project.smmlvValueCOP) > 0 ? Number(project.smmlvValueCOP) : 1423500;
  const totalCOP = items.reduce(
    (acc: number, it: Record<string, any>) =>
      acc + Math.max(0, Number(it.quantity) || 0) * Math.max(0, Number(it.unitValueCOP) || 0),
    0
  );
  const totalSMMLV = totalCOP / smmlv;

  if (items.length === 0) {
    issues.push({
      section: 'Presupuesto · Componente 5',
      message: 'Incluya al menos un rubro financiable autorizado (Art. 17).',
    });
  }
  if (totalSMMLV > 63.0001) {
    issues.push({
      section: 'Presupuesto · Tope 63 SMMLV',
      message: `El presupuesto (${totalSMMLV.toFixed(2)} SMMLV) excede el tope de 63 SMMLV.`,
    });
  }
  if (
    Number(pres.contrapartidaPct) !== 0 ||
    Number(pres.gastosOperacionPct) !== 0 ||
    Number(pres.transferenciaConocimientoPct) !== 0
  ) {
    issues.push({
      section: 'Presupuesto · Reglas de Oro',
      message: 'La Línea SET exige 0% contrapartida, 0% gastos de operación y 0% transferencia.',
    });
  }
  if (
    items.some(
      (it: Record<string, any>) =>
        Number(it.marketCeilingCOP) > 0 && Number(it.unitValueCOP) > Number(it.marketCeilingCOP)
    )
  ) {
    issues.push({
      section: 'Presupuesto · Estudio de Mercado',
      message: 'Hay rubros cuyo valor unitario supera el tope del Estudio de Mercado DSNFT.',
    });
  }
  if (items.some((it: Record<string, any>) => !it.includesTaxesAndGMF)) {
    issues.push({
      section: 'Presupuesto · Impuestos y GMF',
      message: 'Todos los rubros deben incluir impuestos y GMF en su valor unitario.',
    });
  }

  const ind = e2.comp6Indicadores || {};
  if (Number(ind.metaCapacitados) <= 0 || Number(ind.metaCertificados) <= 0) {
    issues.push({
      section: 'Etapa 2 · Componente 6',
      message: 'Defina las metas de trabajadores capacitados y certificados.',
    });
  }
  if (
    typeof e2.comp7GestionConocimiento !== 'string' ||
    e2.comp7GestionConocimiento.trim().length < 10
  ) {
    issues.push({
      section: 'Etapa 2 · Componente 7',
      message: 'Registre la estrategia de Gestión y Apropiación del Conocimiento.',
    });
  }

  if (!e3.avalRegionalObtenido || !String(e3.actoTrasladoPresupuestal || '').trim()) {
    issues.push({
      section: 'Etapa 3 · Radicación y Traslado',
      message: 'Confirme el Aval Regional y el acto administrativo de traslado presupuestal.',
    });
  }

  const vigencia = Number(project.vigencia) || 2026;
  const rps = Array.isArray(e4.rpsPerfeccionados) ? e4.rpsPerfeccionados : [];
  if (rps.length === 0) {
    issues.push({
      section: 'Etapa 4 · Compromiso RP',
      message: 'Registre al menos un Registro Presupuestal (RP) perfeccionado.',
    });
  } else if (
    rps.some(
      (r: Record<string, any>) =>
        !r.fechaRP || String(r.fechaRP) > `${vigencia}-08-31` || !r.polizasAprobadas
    )
  ) {
    issues.push({
      section: 'Etapa 4 · Alerta 31 de Agosto',
      message: 'Todos los RP deben tener pólizas aprobadas y fecha ≤ 31 de agosto.',
    });
  }

  const ev = e5.custodiaEvidencias || {};
  if (!ev.listadosAsistencia || !ev.evaluaciones) {
    issues.push({
      section: 'Etapa 5 · Ejecución y Evidencias',
      message: 'Confirme la custodia de listados de asistencia y evaluaciones.',
    });
  }
  if (
    !e6.liquidacionContractualCompleta ||
    !e6.bovedaConocimientoCargada ||
    typeof e6.informeFinalResultadosArt21 !== 'string' ||
    e6.informeFinalResultadosArt21.trim().length < 10
  ) {
    issues.push({
      section: 'Etapa 6 · Cierre del Proceso',
      message: 'Confirme liquidación contractual, entrega a bóveda e informe final (Art. 21).',
    });
  }

  if (
    !jur.gratuidadAbsolutaArt12 ||
    !jur.propiedadIntelectualArt22 ||
    !jur.proteccionDatosLey1581Art23 ||
    !jur.imagenAusteridadArt24
  ) {
    issues.push({
      section: 'Lineamientos Jurídicos',
      message: 'Verifique los 4 lineamientos jurídicos y éticos obligatorios.',
    });
  }

  const requiredAuditIds = [
    'formulacion',
    'pertinencia',
    'presupuesto',
    'contratacion',
    'ejecucion',
    'juridica',
    'cierre',
  ];
  const missingAudit = requiredAuditIds.filter((id) => !audit[id]?.checked);
  if (missingAudit.length > 0) {
    issues.push({
      section: 'Auditoría Territorial',
      message: `Faltan ${missingAudit.length} punto(s) de control de Auditoría Territorial.`,
    });
  }

  return issues;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  app.get('/api/auth/status', (_req: Request, res: Response) => {
    const store = ensureStoreFile();
    const envPasscodeConfigured = Boolean(
      process.env.SET_ADMIN_PASSCODE && process.env.SET_ADMIN_PASSCODE.trim().length > 0
    );
    res.json({
      hasUsers: store.users.length > 0,
      envPasscodeConfigured,
    });
  });

  app.post('/api/auth/bootstrap', (req: Request, res: Response) => {
    const store = ensureStoreFile();
    const envPasscodeConfigured = Boolean(
      process.env.SET_ADMIN_PASSCODE && process.env.SET_ADMIN_PASSCODE.trim().length > 0
    );
    if (store.users.length > 0 || envPasscodeConfigured) {
      res.status(409).json({
        error: 'El acceso inicial ya fue configurado. Utilice Ingreso por Nombre y Clave.',
      });
      return;
    }

    const { username, password, fullName, regional, centroFormacion, role } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      username.trim().length < 3 ||
      username.trim().length > 80 ||
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 128
    ) {
      res.status(400).json({
        error: 'El nombre de usuario (mín. 3 caracteres) y la clave (mín. 6 caracteres) son obligatorios.',
      });
      return;
    }

    const cleanUsername = username.trim();
    const user: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      username: cleanUsername,
      fullName:
        typeof fullName === 'string' && fullName.trim().length > 0
          ? fullName.trim().slice(0, 120)
          : cleanUsername,
      regional:
        typeof regional === 'string' && regional.trim().length > 0
          ? regional.trim().slice(0, 100)
          : 'Regional Distrito Capital',
      centroFormacion:
        typeof centroFormacion === 'string' && centroFormacion.trim().length > 0
          ? centroFormacion.trim().slice(0, 140)
          : 'Centro de Formación Profesional Integral',
      role:
        typeof role === 'string' && role.trim().length > 0
          ? role.trim().slice(0, 80)
          : 'Coordinador Académico / Enlace SET',
      isAdmin: true,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const starterProject = buildStarterProject(user);
    store.users.push(user);
    store.projects.push(starterProject);
    saveStore(store);

    const token = signToken({
      sub: user.id,
      username: user.username,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });

    res.status(201).json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const { username, password } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      username.trim().length === 0 ||
      typeof password !== 'string' ||
      password.length === 0
    ) {
      res.status(400).json({ error: 'Ingrese su nombre y clave.' });
      return;
    }

    const cleanUsername = username.trim();
    const store = ensureStoreFile();

    let user = store.users.find(
      (u) => u.username.toLowerCase() === cleanUsername.toLowerCase()
    );

    if (verifyEnvPasscode(password)) {
      if (!user) {
        user = {
          id: `usr-${crypto.randomUUID().slice(0, 8)}`,
          username: cleanUsername,
          fullName: cleanUsername,
          regional: 'Dirección General / DSNFT',
          centroFormacion: 'Sede Regional / Centro Autorizado',
          role: 'Subdirector de Centro',
          isAdmin: true,
          passwordHash: hashPassword(password),
          createdAt: new Date().toISOString(),
        };
        store.users.push(user);
        store.projects.push(buildStarterProject(user));
        saveStore(store);
      }
      const token = signToken({
        sub: user.id,
        username: user.username,
        exp: Date.now() + 1000 * 60 * 60 * 12,
      });
      res.json({ token, user: sanitizeUser(user) });
      return;
    }

    if (!user || !verifyPassword(password, user.passwordHash)) {
      res.status(401).json({ error: 'Nombre o clave incorrectos.' });
      return;
    }

    const token = signToken({
      sub: user.id,
      username: user.username,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });
    res.json({ token, user: sanitizeUser(user) });
  });

  app.post('/api/auth/register', (req: Request, res: Response) => {
    const { username, password, fullName, regional, centroFormacion, role } = req.body ?? {};
    if (
      typeof username !== 'string' ||
      username.trim().length < 3 ||
      username.trim().length > 80 ||
      typeof password !== 'string' ||
      password.length < 6 ||
      password.length > 128
    ) {
      res.status(400).json({
        error: 'El nombre (mín. 3 caracteres) y la clave (mín. 6 caracteres) son obligatorios.',
      });
      return;
    }

    const store = ensureStoreFile();
    const cleanUsername = username.trim();
    if (store.users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      res.status(409).json({ error: 'Ya existe un usuario registrado con ese nombre.' });
      return;
    }

    const allowedRoles = [
      'Subdirector de Centro',
      'Coordinador Académico / Enlace SET',
      'Dirección Regional',
      'Apoyo Administrativo Mixto',
    ];
    const safeRole =
      typeof role === 'string' && allowedRoles.includes(role)
        ? role
        : 'Coordinador Académico / Enlace SET';

    const newUser: StoredUser = {
      id: `usr-${crypto.randomUUID().slice(0, 8)}`,
      username: cleanUsername,
      fullName:
        typeof fullName === 'string' && fullName.trim().length > 0
          ? fullName.trim().slice(0, 120)
          : cleanUsername,
      regional:
        typeof regional === 'string' && regional.trim().length > 0
          ? regional.trim().slice(0, 100)
          : 'Regional Antioquia',
      centroFormacion:
        typeof centroFormacion === 'string' && centroFormacion.trim().length > 0
          ? centroFormacion.trim().slice(0, 140)
          : 'Centro de Formación SENA',
      role: safeRole,
      isAdmin: false,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };

    const starterProject = buildStarterProject(newUser);
    store.users.push(newUser);
    store.projects.push(starterProject);
    saveStore(store);

    const token = signToken({
      sub: newUser.id,
      username: newUser.username,
      exp: Date.now() + 1000 * 60 * 60 * 12,
    });

    res.status(201).json({ token, user: sanitizeUser(newUser) });
  });

  app.get('/api/auth/me', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.authUser });
  });

  app.get('/api/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const store = ensureStoreFile();
    const user = req.authUser!;
    const visible = user.isAdmin
      ? store.projects
      : store.projects.filter((p) => p.ownerId === user.id);
    res.json({ projects: visible });
  });

  app.post('/api/projects', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const { title, regional, centroFormacion, vigencia } = req.body ?? {};
    const store = ensureStoreFile();
    const now = new Date().toISOString();
    const created = buildStarterProject({
      ...user,
      regional:
        typeof regional === 'string' && regional.trim()
          ? regional.trim().slice(0, 100)
          : user.regional,
      centroFormacion:
        typeof centroFormacion === 'string' && centroFormacion.trim()
          ? centroFormacion.trim().slice(0, 140)
          : user.centroFormacion,
      passwordHash: '',
      createdAt: now,
    });
    if (typeof title === 'string' && title.trim()) {
      created.title = title.trim().slice(0, 160);
    }
    if (typeof vigencia === 'number' && vigencia >= 2025 && vigencia <= 2035) {
      created.vigencia = Math.trunc(vigencia);
    }
    store.projects.unshift(created);
    saveStore(store);
    res.status(201).json({ project: created });
  });

  app.post(
    '/api/projects/:id/save-draft',
    requireAuth,
    (req: AuthenticatedRequest, res: Response) => {
      const user = req.authUser!;
      const store = ensureStoreFile();
      const idx = store.projects.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        res.status(404).json({ error: 'Proyecto no encontrado.' });
        return;
      }
      const existing = store.projects[idx];
      if (!user.isAdmin && existing.ownerId !== user.id) {
        res.status(403).json({ error: 'No tiene permisos para modificar este proyecto.' });
        return;
      }
      if (existing.status === 'finalizado') {
        res.status(409).json({
          error: 'El proyecto ya cuenta con Guardado Final. Reabra el proceso si requiere ajustes.',
        });
        return;
      }

      const { project: incoming, progressPct, note } = req.body ?? {};
      if (!incoming || typeof incoming !== 'object') {
        res.status(400).json({ error: 'Datos de proyecto inválidos.' });
        return;
      }

      const now = new Date().toISOString();
      const safeProgress =
        typeof progressPct === 'number' && Number.isFinite(progressPct)
          ? Math.max(0, Math.min(100, Math.round(progressPct)))
          : 0;
      const historyEntry = {
        id: `sav-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: now,
        action: 'avance',
        savedBy: user.fullName,
        summary:
          typeof note === 'string' && note.trim()
            ? note.trim().slice(0, 180)
            : `Avance parcial guardado (${safeProgress}% completado)`,
        progressPct: safeProgress,
      };

      const updated = {
        ...existing,
        title:
          typeof incoming.title === 'string' && incoming.title.trim()
            ? incoming.title.trim().slice(0, 180)
            : existing.title,
        regional:
          typeof incoming.regional === 'string' && incoming.regional.trim()
            ? incoming.regional.trim().slice(0, 100)
            : existing.regional,
        centroFormacion:
          typeof incoming.centroFormacion === 'string' && incoming.centroFormacion.trim()
            ? incoming.centroFormacion.trim().slice(0, 140)
            : existing.centroFormacion,
        smmlvValueCOP:
          typeof incoming.smmlvValueCOP === 'number' && incoming.smmlvValueCOP > 0
            ? Math.round(incoming.smmlvValueCOP)
            : existing.smmlvValueCOP,
        vigencia:
          typeof incoming.vigencia === 'number' &&
          incoming.vigencia >= 2025 &&
          incoming.vigencia <= 2035
            ? Math.trunc(incoming.vigencia)
            : existing.vigencia,
        etapa1: incoming.etapa1 ?? existing.etapa1,
        etapa2: incoming.etapa2 ?? existing.etapa2,
        etapa3: incoming.etapa3 ?? existing.etapa3,
        etapa4: incoming.etapa4 ?? existing.etapa4,
        etapa5: incoming.etapa5 ?? existing.etapa5,
        etapa6: incoming.etapa6 ?? existing.etapa6,
        juridico: incoming.juridico ?? existing.juridico,
        auditoriaChecklist: incoming.auditoriaChecklist ?? existing.auditoriaChecklist,
        status: 'en_progreso',
        updatedAt: now,
        lastSavedAt: now,
        saveHistory: [historyEntry, ...(Array.isArray(existing.saveHistory) ? existing.saveHistory : [])].slice(
          0,
          40
        ),
      };

      store.projects[idx] = updated;
      saveStore(store);
      res.json({ project: updated });
    }
  );

  app.post(
    '/api/projects/:id/finalize',
    requireAuth,
    (req: AuthenticatedRequest, res: Response) => {
      const user = req.authUser!;
      const store = ensureStoreFile();
      const idx = store.projects.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        res.status(404).json({ error: 'Proyecto no encontrado.' });
        return;
      }
      const existing = store.projects[idx];
      if (!user.isAdmin && existing.ownerId !== user.id) {
        res.status(403).json({ error: 'No tiene permisos para finalizar este proyecto.' });
        return;
      }

      const { project: incoming } = req.body ?? {};
      const candidate =
        incoming && typeof incoming === 'object'
          ? {
              ...existing,
              title:
                typeof incoming.title === 'string' && incoming.title.trim()
                  ? incoming.title.trim().slice(0, 180)
                  : existing.title,
              regional: incoming.regional ?? existing.regional,
              centroFormacion: incoming.centroFormacion ?? existing.centroFormacion,
              smmlvValueCOP: incoming.smmlvValueCOP ?? existing.smmlvValueCOP,
              vigencia: incoming.vigencia ?? existing.vigencia,
              etapa1: incoming.etapa1 ?? existing.etapa1,
              etapa2: incoming.etapa2 ?? existing.etapa2,
              etapa3: incoming.etapa3 ?? existing.etapa3,
              etapa4: incoming.etapa4 ?? existing.etapa4,
              etapa5: incoming.etapa5 ?? existing.etapa5,
              etapa6: incoming.etapa6 ?? existing.etapa6,
              juridico: incoming.juridico ?? existing.juridico,
              auditoriaChecklist: incoming.auditoriaChecklist ?? existing.auditoriaChecklist,
            }
          : existing;

      const issues = validateProjectForFinalizationServer(candidate);
      if (issues.length > 0) {
        res.status(400).json({
          error: 'El expediente aún no cumple todos los requisitos normativos del Manual Línea SET para el guardado final.',
          issues,
        });
        return;
      }

      const now = new Date().toISOString();
      const vigencia = Number(candidate.vigencia) || 2026;
      const radicadoCode =
        existing.radicadoCode ||
        `SET-${vigencia}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
      const digestPayload = JSON.stringify({
        id: candidate.id,
        title: candidate.title,
        etapa1: candidate.etapa1,
        etapa2: candidate.etapa2,
        etapa3: candidate.etapa3,
        etapa4: candidate.etapa4,
        etapa5: candidate.etapa5,
        etapa6: candidate.etapa6,
        juridico: candidate.juridico,
        auditoriaChecklist: candidate.auditoriaChecklist,
      });
      const integrityHash = crypto.createHash('sha256').update(digestPayload).digest('hex');

      const historyEntry = {
        id: `fin-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: now,
        action: 'finalizacion',
        savedBy: user.fullName,
        summary: `Guardado final del proceso sellado · Radicado ${radicadoCode}`,
        progressPct: 100,
      };

      const finalized = {
        ...candidate,
        status: 'finalizado',
        radicadoCode,
        integrityHash,
        updatedAt: now,
        lastSavedAt: now,
        finalizedAt: now,
        saveHistory: [historyEntry, ...(Array.isArray(existing.saveHistory) ? existing.saveHistory : [])].slice(
          0,
          40
        ),
      };

      store.projects[idx] = finalized;
      saveStore(store);
      res.json({ project: finalized });
    }
  );

  app.post(
    '/api/projects/:id/reopen',
    requireAuth,
    (req: AuthenticatedRequest, res: Response) => {
      const user = req.authUser!;
      const store = ensureStoreFile();
      const idx = store.projects.findIndex((p) => p.id === req.params.id);
      if (idx === -1) {
        res.status(404).json({ error: 'Proyecto no encontrado.' });
        return;
      }
      const existing = store.projects[idx];
      if (!user.isAdmin && existing.ownerId !== user.id) {
        res.status(403).json({ error: 'No tiene permisos para reabrir este proyecto.' });
        return;
      }

      const now = new Date().toISOString();
      const historyEntry = {
        id: `reo-${crypto.randomUUID().slice(0, 8)}`,
        timestamp: now,
        action: 'reapertura',
        savedBy: user.fullName,
        summary: 'Proceso reabierto a estado En Progreso para ajustes técnicos o presupuestales',
        progressPct: 95,
      };

      const updated = {
        ...existing,
        status: 'en_progreso',
        updatedAt: now,
        saveHistory: [historyEntry, ...(Array.isArray(existing.saveHistory) ? existing.saveHistory : [])].slice(
          0,
          40
        ),
      };
      store.projects[idx] = updated;
      saveStore(store);
      res.json({ project: updated });
    }
  );

  app.delete('/api/projects/:id', requireAuth, (req: AuthenticatedRequest, res: Response) => {
    const user = req.authUser!;
    const store = ensureStoreFile();
    const idx = store.projects.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Proyecto no encontrado.' });
      return;
    }
    const existing = store.projects[idx];
    if (!user.isAdmin && existing.ownerId !== user.id) {
      res.status(403).json({ error: 'No tiene permisos para eliminar este proyecto.' });
      return;
    }
    store.projects.splice(idx, 1);
    saveStore(store);
    res.json({ deleted: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor SENA Línea SET activo en puerto ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Error al iniciar servidor:', err);
  process.exit(1);
});
