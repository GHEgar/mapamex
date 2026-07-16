export const PROJECT_META = {
    visor: {
        kind: 'platform',
        editor: 'Edita capas, eventos, símbolos e inicio del visor, y administra sus archivos en el Storage.',
        viewer: 'Consulta y previsualiza; no guarda cambios.',
    },
    mapamex: {
        kind: 'storage',
        note: 'Acceso a los assets institucionales del Storage (logos, íconos, fuentes).',
    },
    cms: {
        kind: 'storage',
        note: 'Acceso a los archivos administrativos privados del Storage.',
    },
};

const DEFAULT_PROJECT_META = {
    kind: 'platform',
    editor: 'Crea y edita el contenido del proyecto, y administra sus archivos en el Storage.',
    viewer: 'Consulta y previsualiza; no guarda cambios.',
};

export const metaFor = (slug) => PROJECT_META[slug] || DEFAULT_PROJECT_META;

export const allowedSlugsForRole = (role, projects = []) => {
    if (role === 'editora') return projects.map((p) => p.slug);
    return [];
};
