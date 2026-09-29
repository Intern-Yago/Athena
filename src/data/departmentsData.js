/**
 * Macro-Departamentos e Estrutura Hierárquica do Catálogo Athena
 * Agrupa as 46 categorias técnicas do banco em 8 Macro-Departamentos intuitivos (Estilo KaBuM! / Amazon).
 */

export const MACRO_DEPARTMENTS = [
  {
    id: 'dept_funilaria_estetica',
    name: 'Funilaria, Pintura & Estética',
    shortName: 'Funilaria & Estética',
    icon: 'Sparkles',
    categoryIds: [
      'cat_estetica_pintura',
      'cat_1788296844334'
    ]
  },
  {
    id: 'dept_borracharia_pneus',
    name: 'Borracharia, Pneus & Alinhamento',
    shortName: 'Borracharia & Pneus',
    icon: 'Disc',
    categoryIds: [
      'cat_desmontadoras',
      'cat_alinhadores',
      'cat_1789998064578',
      'cat_1790004280111',
      'cat_1790016852133',
      'cat_1790018712284'
    ]
  },
  {
    id: 'dept_elevacao_pesada',
    name: 'Elevação & Mecânica Pesada',
    shortName: 'Elevação Automotiva',
    icon: 'Layers',
    categoryIds: [
      'cat_elevadores',
      'cat_1789587656316',
      'cat_1787862527630',
      'cat_1788192370106',
      'cat_1787861438469',
      'cat_1787859780339',
      'cat_1790178421551'
    ]
  },
  {
    id: 'dept_eletrica_diagnostico',
    name: 'Auto Elétrica & Diagnóstico',
    shortName: 'Elétrica & Diagnóstico',
    icon: 'Cpu',
    categoryIds: [
      'cat_scanners',
      'cat_1790625264032',
      'cat_1790625158162',
      'cat_1788377224759',
      'cat_1790625361659',
      'cat_1789414354078',
      'cat_1789665153180',
      'cat_1790627904180',
      'cat_1788270975595'
    ]
  },
  {
    id: 'dept_oleo_fluidos',
    name: 'Troca de Óleo, Fluidos & Lubrificação',
    shortName: 'Óleo & Fluidos',
    icon: 'Droplet',
    categoryIds: [
      'cat_1790179785560',
      'cat_1788371138282',
      'cat_1790191269984'
    ]
  },
  {
    id: 'dept_ferramentas_manuais',
    name: 'Ferramentas Manuais & Soquetes',
    shortName: 'Ferramentas & Soquetes',
    icon: 'Wrench',
    categoryIds: [
      'cat_ferramentas',
      'cat_1790341668541',
      'cat_1789498107322',
      'cat_1789499887542',
      'cat_1789405752776',
      'cat_1789067073450',
      'cat_1789075823822',
      'cat_1789496349243',
      'cat_1790615097459',
      'cat_1790615634326',
      'cat_1789073912116',
      'cat_1790616153068'
    ]
  },
  {
    id: 'dept_pneumatica_ar',
    name: 'Pneumática & Ferramentas a Bateria',
    shortName: 'Pneumática & Bateria',
    icon: 'Wind',
    categoryIds: [
      'cat_1788453768939',
      'cat_1789409045834',
      'cat_1789407125697',
      'cat_1789410127824'
    ]
  },
  {
    id: 'dept_organizacao_oficina',
    name: 'Mobiliário & Organização de Oficina',
    shortName: 'Mobiliário & Armários',
    icon: 'Box',
    categoryIds: [
      'cat_1789413477954',
      'cat_1790345836898',
      'cat_1789401844085'
    ]
  }
];

/**
 * Returns the macro department that contains a given categoryId.
 * Checks category.departmentId first if categories array is provided.
 */
export function getDepartmentByCategoryId(categoryId, categories = [], departments = MACRO_DEPARTMENTS) {
  if (!categoryId) return null;
  const depts = Array.isArray(departments) && departments.length > 0 ? departments : MACRO_DEPARTMENTS;
  
  if (Array.isArray(categories) && categories.length > 0) {
    const cat = categories.find(c => c.id === categoryId);
    if (cat?.departmentId) {
      const dept = depts.find(d => d.id === cat.departmentId);
      if (dept) return dept;
    }
  }
  
  return depts.find(dept => (dept.categoryIds || []).includes(categoryId)) || null;
}

/**
 * Returns department by its department ID.
 */
export function getDepartmentById(deptId, departments = MACRO_DEPARTMENTS) {
  if (!deptId) return null;
  const depts = Array.isArray(departments) && departments.length > 0 ? departments : MACRO_DEPARTMENTS;
  return depts.find(dept => dept.id === deptId) || null;
}

/**
 * Returns all categories belonging to a given macro department.
 */
export function getCategoriesForDepartment(deptId, categories = [], departments = MACRO_DEPARTMENTS) {
  if (!deptId || !Array.isArray(categories)) return [];
  const dept = getDepartmentById(deptId, departments);
  return categories.filter(cat => {
    if (cat.departmentId) {
      return cat.departmentId === deptId;
    }
    return dept ? (dept.categoryIds || []).includes(cat.id) : false;
  });
}

/**
 * Resolves an icon name string to an icon component (or default Layers).
 */
export function getDepartmentIconName(deptId, departments = MACRO_DEPARTMENTS) {
  const dept = getDepartmentById(deptId, departments);
  return dept?.icon || 'Layers';
}
