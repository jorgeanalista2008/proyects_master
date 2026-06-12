import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import * as bcrypt from 'bcrypt';

const host = process.env.DB_HOST || 'localhost';
const port = parseInt(process.env.DB_PORT || '3306', 10);
const user = process.env.DB_USER || 'root';
const password = process.env.DB_PASSWORD || '';
const database = process.env.DB_NAME || 'projects_master_db';

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Iniciando Seeding...');

  // 1. Crear Roles
  const adminRole = await prisma.role.upsert({
    where: { name: 'ADMIN' },
    update: {},
    create: {
      name: 'ADMIN',
      description: 'Administrador del sistema con acceso total',
    },
  });

  const sellerRole = await prisma.role.upsert({
    where: { name: 'SELLER' },
    update: {},
    create: {
      name: 'SELLER',
      description: 'Vendedor / Cotizador de proyectos',
    },
  });

  const technicianRole = await prisma.role.upsert({
    where: { name: 'TECHNICIAN' },
    update: {},
    create: {
      name: 'TECHNICIAN',
      description: 'Técnico de levantamiento e instalación',
    },
  });

  const clientRole = await prisma.role.upsert({
    where: { name: 'CLIENT' },
    update: {},
    create: {
      name: 'CLIENT',
      description: 'Cliente visualizador de presupuestos y proyectos',
    },
  });

  console.log('Roles creados o actualizados.');

  // 2. Crear Administrador Inicial
  const adminPasswordHash = bcrypt.hashSync('AdminPassword123', 10);
  const defaultAdmin = await prisma.user.upsert({
    where: { email: 'admin@securitysystem.com' },
    update: {},
    create: {
      email: 'admin@securitysystem.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Security',
      phone: '+56912345678',
      roleId: adminRole.id,
      isActive: true,
    },
  });

  console.log('Administrador por defecto creado:', defaultAdmin.email);

  // 3. Crear Productos de Prueba
  const products = [
    {
      sku: 'CAM-DOM-001',
      name: 'Cámara Domo IP 4MP',
      description: 'Cámara domo de seguridad IP con resolución de 4MP, visión nocturna infrarroja y resistencia a la intemperie (IP67).',
      category: 'CAMERA' as const,
      unitCost: 25.5000,
      margin: 40.00,
      salePrice: 35.7000,
    },
    {
      sku: 'NVR-08C-002',
      name: 'NVR 8 Canales 4K',
      description: 'Grabador de video en red (NVR) de 8 canales con soporte de resolución hasta 4K y compresión H.265+.',
      category: 'DVR_NVR' as const,
      unitCost: 110.0000,
      margin: 45.00,
      salePrice: 159.5000,
    },
    {
      sku: 'CAB-UTP-003',
      name: 'Bobina Cable UTP Cat6 305m',
      description: 'Bobina de cable de red UTP Categoría 6, 100% cobre, ideal para transmisiones Gigabit y tendidos de CCTV.',
      category: 'CABLE' as const,
      unitCost: 65.0000,
      margin: 35.00,
      salePrice: 87.7500,
    },
    {
      sku: 'LAB-TEC-004',
      name: 'Hora de Mano de Obra Técnica',
      description: 'Hora de servicio de instalación, montaje y conexionado de cámaras o sistemas de seguridad por técnico calificado.',
      category: 'LABOR' as const,
      unitCost: 15.0000,
      margin: 66.67,
      salePrice: 25.0000,
    },
    {
      sku: 'SRV-LEV-005',
      name: 'Servicio de Levantamiento Técnico y Diseño',
      description: 'Visita técnica al sitio del cliente para tomar medidas, evaluar la topografía, definir puntos de cámaras y diseñar planos de canalización.',
      category: 'SERVICE' as const,
      unitCost: 0.0000,
      margin: 0.00,
      salePrice: 35.0000,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        description: prod.description,
        unitCost: prod.unitCost,
        margin: prod.margin,
        salePrice: prod.salePrice,
      },
      create: prod,
    });
  }

  console.log('Productos de catálogo creados.');
  console.log('Seeding Completado con Éxito!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
