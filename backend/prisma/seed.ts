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
    { name: 'suppliers:read', description: 'Ver directorio de proveedores' },
    { name: 'suppliers:write', description: 'Administrar proveedores' },
    { name: 'technicians:read', description: 'Ver perfiles de técnicos' },
    { name: 'technicians:write', description: 'Administrar técnicos' },
    { name: 'analytics:read', description: 'Ver analíticas de rentabilidad y margen' },
    { name: 'settings:write', description: 'Modificar personalización del software' },
    { name: 'users:write', description: 'Administrar usuarios, perfiles, permisos y menús' },
    { name: 'equipments:read', description: 'Ver recepciones de equipos' },
    { name: 'equipments:write', description: 'Crear, asignar y cambiar estado de equipos' },
  ];

  // Definir Menús del Sistema
  const menuItemsList = [
    { label: 'Inicio', route: '/', icon: 'mdi:view-dashboard-outline', order: 1 },
    { label: 'Proyectos', route: '/projects', icon: 'mdi:briefcase-outline', order: 2 },
    { label: 'Catálogo e Inventario', route: '/catalog', icon: 'mdi:archive-outline', order: 3 },
    { label: 'Clientes', route: '/clients', icon: 'mdi:account-group-outline', order: 4 },
    { label: 'Proveedores', route: '/suppliers', icon: 'mdi:truck-delivery-outline', order: 5 },
    { label: 'Soporte Técnico', route: '/equipments', icon: 'mdi:laptop-wrench', order: 6 },
    { label: 'Técnicos', route: '/technicians', icon: 'mdi:account-wrench-outline', order: 7 },
    { label: 'Analíticas y Margen', route: '/analytics', icon: 'mdi:chart-timeline-variant', order: 8 },
    { label: 'Personalización', route: '/settings', icon: 'mdi:settings-outline', order: 9 },
    { label: 'Documentación', route: '/documentation', icon: 'mdi:book-open-page-variant-outline', order: 10 },
    { label: 'Administración', route: '/roles', icon: 'mdi:shield-key-outline', order: 11 },
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
      'suppliers:read', 'suppliers:write',
      'technicians:read', 'analytics:read',
      'equipments:read', 'equipments:write'
    ],
    ['/', '/projects', '/catalog', '/clients', '/suppliers', '/equipments', '/technicians', '/analytics', '/documentation']
  );

  await syncRoleRelations(
    'TECHNICIAN',
    ['projects:read', 'quotes:read', 'catalog:read', 'equipments:read', 'equipments:write'],
    ['/', '/projects', '/catalog', '/equipments', '/documentation']
  );

  await syncRoleRelations(
    'CLIENT',
    ['projects:read', 'quotes:read', 'equipments:read'],
    ['/', '/projects', '/documentation']
  );

  console.log('Relaciones de roles y permisos sincronizadas.');

  // 4. Crear Administradores Iniciales
  const passwordCeoGuslaya = bcrypt.hashSync('Gustavo.8826##', 10);
  const defaultAdmin1 = await prisma.user.upsert({
    where: { email: 'ceo@guslaya.com' },
    update: {
      roleId: seededRoles['ADMIN'].id,
    },
    create: {
      email: 'ceo@guslaya.com',
      passwordHash: passwordCeoGuslaya,
      firstName: 'Gustavo',
      lastName: 'Guslaya',
      phone: '+56900000001',
      roleId: seededRoles['ADMIN'].id,
      isActive: true,
    },
  });
  console.log('Administrador 1 creado o actualizado:', defaultAdmin1.email);

  const passwordCeoNexxos = bcrypt.hashSync('Jorge.8826##', 10);
  const defaultAdmin2 = await prisma.user.upsert({
    where: { email: 'ceo@nexxos.pro' },
    update: {
      roleId: seededRoles['ADMIN'].id,
    },
    create: {
      email: 'ceo@nexxos.pro',
      passwordHash: passwordCeoNexxos,
      firstName: 'Jorge',
      lastName: 'Nexxos',
      phone: '+56900000002',
      roleId: seededRoles['ADMIN'].id,
      isActive: true,
    },
  });
  console.log('Administrador 2 creado o actualizado:', defaultAdmin2.email);

  // 3. Crear Categorías de Prueba
  const categoriesList = [
    { name: 'CAMERA', label: 'Cámara de Seguridad' },
    { name: 'DVR_NVR', label: 'Grabador DVR / NVR' },
    { name: 'CABLE', label: 'Cableado Estructurado' },
    { name: 'TUBING', label: 'Tuberías y Canalización' },
    { name: 'ACCESSORY', label: 'Accesorios / Anclajes' },
    { name: 'LABOR', label: 'Mano de Obra' },
    { name: 'SERVICE', label: 'Servicios / Viáticos' }
  ];

  const seededCategories: Record<string, any> = {};
  for (const cat of categoriesList) {
    const c = await prisma.category.upsert({
      where: { name: cat.name },
      update: { label: cat.label },
      create: cat
    });
    seededCategories[cat.name] = c;
  }
  console.log('Categorías creadas.');

  // 4. Crear Productos de Prueba
  const products = [
    {
      sku: 'CAM-DOM-001',
      name: 'Cámara Domo IP 4MP',
      description: 'Cámara domo de seguridad IP con resolución de 4MP, visión nocturna infrarroja y resistencia a la intemperie (IP67).',
      categoryKey: 'CAMERA',
      unitCost: 25.5000,
      marginCash: 30.00,
      priceCash: 33.1500,
      marginCredit: 40.00,
      priceCredit: 35.7000,
      marginPreferred: 20.00,
      pricePreferred: 30.6000,
    },
    {
      sku: 'CAM-PTZ-002',
      name: 'Cámara PTZ Exterior 2MP 25x',
      description: 'Cámara domo motorizada PTZ de 2 Megapíxeles, zoom óptico de 25x, seguimiento inteligente por IA y alcance IR de 150 metros.',
      categoryKey: 'CAMERA',
      unitCost: 280.0000,
      marginCash: 35.00,
      priceCash: 378.0000,
      marginCredit: 45.00,
      priceCredit: 406.0000,
      marginPreferred: 25.00,
      pricePreferred: 350.0000,
    },
    {
      sku: 'NVR-08C-002',
      name: 'NVR 8 Canales 4K',
      description: 'Grabador de video en red (NVR) de 8 canales con soporte de resolución hasta 4K y compresión H.265+.',
      categoryKey: 'DVR_NVR',
      unitCost: 110.0000,
      marginCash: 30.00,
      priceCash: 143.0000,
      marginCredit: 45.00,
      priceCredit: 159.5000,
      marginPreferred: 20.00,
      pricePreferred: 132.0000,
    },
    {
      sku: 'NVR-16C-003',
      name: 'NVR 16 Canales con PoE',
      description: 'Grabador NVR de 16 canales de video, 16 puertos PoE integrados, soporta hasta 2 discos duros SATA de 10TB cada uno.',
      categoryKey: 'DVR_NVR',
      unitCost: 225.0000,
      marginCash: 30.00,
      priceCash: 292.5000,
      marginCredit: 40.00,
      priceCredit: 315.0000,
      marginPreferred: 20.00,
      pricePreferred: 270.0000,
    },
    {
      sku: 'CAB-UTP-003',
      name: 'Bobina Cable UTP Cat6 305m',
      description: 'Bobina de cable de red UTP Categoría 6, 100% cobre, ideal para transmisiones Gigabit y tendidos de CCTV.',
      categoryKey: 'CABLE',
      unitCost: 65.0000,
      marginCash: 30.00,
      priceCash: 84.5000,
      marginCredit: 35.00,
      priceCredit: 87.7500,
      marginPreferred: 20.00,
      pricePreferred: 78.0000,
    },
    {
      sku: 'TUB-CON-004',
      name: 'Tubo Conduit Galvanizado 3/4 3m',
      description: 'Tubería metálica rígida tipo Conduit Galvanizado de 3/4 pulgada por 3 metros de largo para protección de cables exteriores.',
      categoryKey: 'TUBING',
      unitCost: 8.5000,
      marginCash: 40.00,
      priceCash: 11.9000,
      marginCredit: 50.00,
      priceCredit: 12.7500,
      marginPreferred: 25.00,
      pricePreferred: 10.6300,
    },
    {
      sku: 'ACC-CON-005',
      name: 'Conector Caja Conduit 3/4',
      description: 'Conector metálico para acoplar tubos Conduit de 3/4 a cajas de paso estancas en exterior.',
      categoryKey: 'ACCESSORY',
      unitCost: 0.9000,
      marginCash: 60.05,
      priceCash: 1.4400,
      marginCredit: 80.00,
      priceCredit: 1.6200,
      marginPreferred: 40.00,
      pricePreferred: 1.2605,
    },
    {
      sku: 'LAB-TEC-004',
      name: 'Hora de Mano de Obra Técnica',
      description: 'Hora de servicio de instalación, montaje y conexionado de cámaras o sistemas de seguridad por técnico calificado.',
      categoryKey: 'LABOR',
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
      categoryKey: 'SERVICE',
      unitCost: 0.0000,
      marginCash: 0.00,
      priceCash: 30.0000,
      marginCredit: 0.00,
      priceCredit: 35.0000,
      marginPreferred: 0.00,
      pricePreferred: 25.0000,
    },
    {
      sku: 'SRV-MNT-006',
      name: 'Servicio Anual de Mantenimiento Preventivo',
      description: 'Póliza anual de mantenimiento preventivo de hasta 8 cámaras, incluye limpieza de lentes, verificación de conectores, y actualización de firmware.',
      categoryKey: 'SERVICE',
      unitCost: 120.0000,
      marginCash: 40.00,
      priceCash: 168.0000,
      marginCredit: 50.00,
      priceCredit: 180.0000,
      marginPreferred: 25.00,
      pricePreferred: 150.0000,
    },
  ];

  for (const prod of products) {
    const category = seededCategories[prod.categoryKey];
    await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {
        name: prod.name,
        description: prod.description,
        categoryId: category.id,
        unitCost: prod.unitCost,
        marginCash: prod.marginCash,
        priceCash: prod.priceCash,
        marginCredit: prod.marginCredit,
        priceCredit: prod.priceCredit,
        marginPreferred: prod.marginPreferred,
        pricePreferred: prod.pricePreferred,
      },
      create: {
        sku: prod.sku,
        name: prod.name,
        description: prod.description,
        categoryId: category.id,
        unitCost: prod.unitCost,
        marginCash: prod.marginCash,
        priceCash: prod.priceCash,
        marginCredit: prod.marginCredit,
        priceCredit: prod.priceCredit,
        marginPreferred: prod.marginPreferred,
        pricePreferred: prod.pricePreferred,
      },
    });
  }

  console.log('Productos de catálogo creados.');

  // 5. Crear Proveedores de Prueba
  console.log('Sembrando proveedores...');
  const suppliersList = [
    { name: 'Syscom Chile', contact: 'Juan Pérez', email: 'ventas@syscom.cl', phone: '+56911112222', address: 'Av. El Condor 123, Huechuraba' },
    { name: 'Tecnosinergia', contact: 'Maria Gómez', email: 'contacto@tecnosinergia.cl', phone: '+56933334444', address: 'Av. Santa Maria 456, Providencia' },
    { name: 'Intcomex', contact: 'Carlos Plaza', email: 'ventas.cl@intcomex.com', phone: '+56222223333', address: 'Av. Américo Vespucio 789, Pudahuel' }
  ];
  for (const sup of suppliersList) {
    const existing = await prisma.supplier.findFirst({ where: { name: sup.name } });
    if (!existing) {
      await prisma.supplier.create({ data: sup });
    }
  }

  // Asociar proveedores a productos de prueba
  console.log('Asociando proveedores a productos de prueba...');
  const syscom = await prisma.supplier.findFirst({ where: { name: 'Syscom Chile' } });
  const tecnosinergia = await prisma.supplier.findFirst({ where: { name: 'Tecnosinergia' } });
  
  if (syscom && tecnosinergia) {
    // CAM-DOM-001 -> Syscom y Tecnosinergia
    const p1 = await prisma.product.findUnique({ where: { sku: 'CAM-DOM-001' } });
    if (p1) {
      await prisma.productSupplier.deleteMany({ where: { productId: p1.id } });
      await prisma.productSupplier.createMany({
        data: [
          { productId: p1.id, supplierId: syscom.id },
          { productId: p1.id, supplierId: tecnosinergia.id }
        ]
      });
    }

    // CAM-PTZ-002 -> Syscom
    const p2 = await prisma.product.findUnique({ where: { sku: 'CAM-PTZ-002' } });
    if (p2) {
      await prisma.productSupplier.deleteMany({ where: { productId: p2.id } });
      await prisma.productSupplier.create({
        data: { productId: p2.id, supplierId: syscom.id }
      });
    }
  }

  // 6. Crear Configuración Global
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
