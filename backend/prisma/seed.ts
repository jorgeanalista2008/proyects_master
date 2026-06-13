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

  // Definir Permisos del Sistema
  const permissionsList = [
    { name: 'projects:read', description: 'Ver proyectos asignados o del cliente' },
    { name: 'projects:write', description: 'Crear, editar y eliminar proyectos' },
    { name: 'quotes:read', description: 'Ver cotizaciones' },
    { name: 'quotes:write', description: 'Crear, editar y eliminar cotizaciones' },
    { name: 'catalog:read', description: 'Ver catálogo e inventario' },
    { name: 'catalog:write', description: 'Administrar catálogo (crear/editar/borrar)' },
    { name: 'clients:read', description: 'Ver directorio de clientes' },
    { name: 'clients:write', description: 'Administrar clientes' },
    { name: 'technicians:read', description: 'Ver perfiles de técnicos' },
    { name: 'technicians:write', description: 'Administrar técnicos' },
    { name: 'analytics:read', description: 'Ver analíticas de rentabilidad y margen' },
    { name: 'settings:write', description: 'Modificar personalización del software' },
    { name: 'users:write', description: 'Administrar usuarios, perfiles, permisos y menús' },
  ];

  // Definir Menús del Sistema
  const menuItemsList = [
    { label: 'Inicio', route: '/', icon: '📊', order: 1 },
    { label: 'Proyectos', route: '/projects', icon: '📁', order: 2 },
    { label: 'Catálogo e Inventario', route: '/catalog', icon: '📦', order: 3 },
    { label: 'Clientes', route: '/clients', icon: '👥', order: 4 },
    { label: 'Técnicos', route: '/technicians', icon: '🛠️', order: 5 },
    { label: 'Analíticas y Margen', route: '/analytics', icon: '📈', order: 6 },
    { label: 'Personalización', route: '/settings', icon: '⚙️', order: 7 },
    { label: 'Documentación', route: '/documentation', icon: '📚', order: 8 },
    { label: 'Administración', route: '/roles', icon: '🔑', order: 9 },
  ];

  // 1. Sembrar Permisos
  const seededPermissions: Record<string, any> = {};
  for (const perm of permissionsList) {
    const p = await prisma.permission.upsert({
      where: { name: perm.name },
      update: { description: perm.description },
      create: perm,
    });
    seededPermissions[perm.name] = p;
  }
  console.log('Permisos sembrados.');

  // 2. Sembrar Menús
  const seededMenus: Record<string, any> = {};
  for (const menu of menuItemsList) {
    let m = await prisma.menuItem.findFirst({ where: { route: menu.route } });
    if (!m) {
      m = await prisma.menuItem.create({ data: menu });
    } else {
      m = await prisma.menuItem.update({
        where: { id: m.id },
        data: { label: menu.label, icon: menu.icon, order: menu.order },
      });
    }
    seededMenus[menu.route] = m;
  }
  console.log('Menús sembrados.');

  // 3. Sembrar Roles Estándar
  const rolesList = [
    { name: 'ADMIN', description: 'Administrador del sistema con acceso total' },
    { name: 'SELLER', description: 'Vendedor / Cotizador de proyectos' },
    { name: 'TECHNICIAN', description: 'Técnico de levantamiento e instalación' },
    { name: 'CLIENT', description: 'Cliente visualizador de presupuestos y proyectos' },
  ];

  const seededRoles: Record<string, any> = {};
  for (const role of rolesList) {
    const r = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: role,
    });
    seededRoles[role.name] = r;
  }
  console.log('Roles creados o actualizados.');

  // Función para asociar permisos y menús a un rol
  async function syncRoleRelations(roleName: string, permissions: string[], menuRoutes: string[]) {
    const role = seededRoles[roleName];
    if (!role) return;

    // Borrar asociaciones previas
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    await prisma.roleMenu.deleteMany({ where: { roleId: role.id } });

    // Crear nuevas asociaciones de permisos
    for (const permName of permissions) {
      const perm = seededPermissions[permName];
      if (perm) {
        await prisma.rolePermission.create({
          data: { roleId: role.id, permissionId: perm.id },
        });
      }
    }

    // Crear nuevas asociaciones de menús
    for (const route of menuRoutes) {
      const menu = seededMenus[route];
      if (menu) {
        await prisma.roleMenu.create({
          data: { roleId: role.id, menuItemId: menu.id },
        });
      }
    }
  }

  // Sincronizar relaciones para perfiles estándar
  await syncRoleRelations(
    'ADMIN',
    permissionsList.map(p => p.name),
    menuItemsList.map(m => m.route)
  );

  await syncRoleRelations(
    'SELLER',
    [
      'projects:read', 'projects:write',
      'quotes:read', 'quotes:write',
      'catalog:read', 'catalog:write',
      'clients:read', 'clients:write',
      'technicians:read', 'analytics:read'
    ],
    ['/', '/projects', '/catalog', '/clients', '/technicians', '/analytics', '/documentation']
  );

  await syncRoleRelations(
    'TECHNICIAN',
    ['projects:read', 'quotes:read', 'catalog:read'],
    ['/', '/projects', '/catalog', '/documentation']
  );

  await syncRoleRelations(
    'CLIENT',
    ['projects:read', 'quotes:read'],
    ['/', '/projects', '/documentation']
  );

  console.log('Relaciones de roles y permisos sincronizadas.');

  // 4. Crear Administrador Inicial
  const adminPasswordHash = bcrypt.hashSync('AdminPassword123', 10);
  const defaultAdmin = await prisma.user.upsert({
    where: { email: 'admin@securitysystem.com' },
    update: {
      roleId: seededRoles['ADMIN'].id,
    },
    create: {
      email: 'admin@securitysystem.com',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'Security',
      phone: '+56912345678',
      roleId: seededRoles['ADMIN'].id,
      isActive: true,
    },
  });

  console.log('Administrador por defecto creado o actualizado:', defaultAdmin.email);

  // 3. Crear Productos de Prueba
  const products = [
    {
      sku: 'CAM-DOM-001',
      name: 'Cámara Domo IP 4MP',
      description: 'Cámara domo de seguridad IP con resolución de 4MP, visión nocturna infrarroja y resistencia a la intemperie (IP67).',
      category: 'CAMERA' as const,
      unitCost: 25.5000,
      marginCash: 30.00,
      priceCash: 33.1500,
      marginCredit: 40.00,
      priceCredit: 35.7000,
      marginPreferred: 20.00,
      pricePreferred: 30.6000,
    },
    {
      sku: 'NVR-08C-002',
      name: 'NVR 8 Canales 4K',
      description: 'Grabador de video en red (NVR) de 8 canales con soporte de resolución hasta 4K y compresión H.265+.',
      category: 'DVR_NVR' as const,
      unitCost: 110.0000,
      marginCash: 30.00,
      priceCash: 143.0000,
      marginCredit: 45.00,
      priceCredit: 159.5000,
      marginPreferred: 20.00,
      pricePreferred: 132.0000,
    },
    {
      sku: 'CAB-UTP-003',
      name: 'Bobina Cable UTP Cat6 305m',
      description: 'Bobina de cable de red UTP Categoría 6, 100% cobre, ideal para transmisiones Gigabit y tendidos de CCTV.',
      category: 'CABLE' as const,
      unitCost: 65.0000,
      marginCash: 30.00,
      priceCash: 84.5000,
      marginCredit: 35.00,
      priceCredit: 87.7500,
      marginPreferred: 20.00,
      pricePreferred: 78.0000,
    },
    {
      sku: 'LAB-TEC-004',
      name: 'Hora de Mano de Obra Técnica',
      description: 'Hora de servicio de instalación, montaje y conexionado de cámaras o sistemas de seguridad por técnico calificado.',
      category: 'LABOR' as const,
      unitCost: 15.0000,
      marginCash: 50.00,
      priceCash: 22.5000,
      marginCredit: 66.67,
      priceCredit: 25.0000,
      marginPreferred: 30.00,
      pricePreferred: 19.5000,
    },
    {
      sku: 'SRV-LEV-005',
      name: 'Servicio de Levantamiento Técnico y Diseño',
      description: 'Visita técnica al sitio del cliente para tomar medidas, evaluar la topografía, definir puntos de cámaras y diseñar planos de canalización.',
      category: 'SERVICE' as const,
      unitCost: 0.0000,
      marginCash: 0.00,
      priceCash: 30.0000,
      marginCredit: 0.00,
      priceCredit: 35.0000,
      marginPreferred: 0.00,
      pricePreferred: 25.0000,
    },
  ];

  for (const prod of products) {
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        description: prod.description,
        unitCost: prod.unitCost,
        marginCash: prod.marginCash,
        priceCash: prod.priceCash,
        marginCredit: prod.marginCredit,
        priceCredit: prod.priceCredit,
        marginPreferred: prod.marginPreferred,
        pricePreferred: prod.pricePreferred,
      },
      create: prod,
    });
  }

  console.log('Productos de catálogo creados.');

  // 4. Crear Configuración Global
  await prisma.systemConfig.upsert({
    where: { id: 'global' },
    update: {
      primaryColor: '#7367F0',
      accentColor: '#82868B',
    },
    create: {
      id: 'global',
      appName: 'SecurityNet S.A.',
      phone: '+56912345678',
      email: 'contacto@securitynet.cl',
      address: 'Av. Providencia 1254, Oficina 402, Santiago, Chile',
      website: 'www.securitynet.cl',
      primaryColor: '#7367F0',
      accentColor: '#82868B',
      defaultTheme: 'dark',
    },
  });
  console.log('Configuración global de sistema creada.');

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
