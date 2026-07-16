export const ROLE_TAG = {
    tetlamamakani: { color: 'red', label: 'Administradora' },
    editora: { color: 'blue', label: 'Editora' },
};

export const ACTION_PREFIXES = [
    { value: 'user.', label: 'Usuarios (user.*)' },
    { value: 'login.', label: 'Login (login.*)' },
    { value: 'evento.', label: 'Eventos (evento.*)' },
    { value: 'home.', label: 'Home (home.*)' },
    { value: 'storage.', label: 'Storage (storage.*)' },
];

export const ACTION_LABELS = {
    'login.success': { text: 'Inicio de sesión', color: 'green' },
    'login.failed': { text: 'Inicio de sesión fallido', color: 'red' },
    'login.logout': { text: 'Cierre de sesión', color: 'default' },
    'user.create': { text: 'Usuario creado', color: 'green' },
    'user.update': { text: 'Usuario actualizado', color: 'blue' },
    'user.delete': { text: 'Usuario eliminado', color: 'red' },
    'user.reset_password': { text: 'Contraseña restablecida', color: 'orange' },
    'evento.create': { text: 'Evento creado', color: 'green' },
    'evento.update': { text: 'Evento actualizado', color: 'blue' },
    'evento.delete': { text: 'Evento eliminado', color: 'red' },
    'evento.publicar': { text: 'Evento publicado', color: 'green' },
    'evento.despublicar': { text: 'Evento despublicado', color: 'orange' },
    'home.update_draft': { text: 'Borrador de home actualizado', color: 'blue' },
    'home.publicar': { text: 'Home publicado', color: 'green' },
    'home.descartar_borrador': { text: 'Borrador de home descartado', color: 'orange' },
    'storage.file.upload': { text: 'Archivo subido al Storage', color: 'green' },
    'storage.file.move': { text: 'Archivo movido de carpeta', color: 'blue' },
    'storage.file.delete': { text: 'Archivo eliminado del Storage', color: 'red' },
    'storage.folder.create': { text: 'Carpeta creada en el Storage', color: 'green' },
    'storage.folder.delete': { text: 'Carpeta eliminada del Storage', color: 'red' },
};

export const RESOURCE_LABELS = {
    usuario: 'Usuario',
    evento: 'Evento',
    home_section: 'Sección de home',
    'storage.file': 'Archivo de Storage',
    'storage.folder': 'Carpeta de Storage',
};

export const META_KEY_LABELS = {
    username: 'Usuario',
    role: 'Rol',
    name: 'Nombre',
    slug: 'Slug',
    estado_from: 'Estado anterior',
    estado_to: 'Estado nuevo',
    version_from: 'Versión anterior',
    version_to: 'Versión nueva',
    campos: 'Campos modificados',
    fields: 'Campos modificados',
    nombre: 'Nombre',
    bucket: 'Bucket',
    carpeta: 'Carpeta',
    de: 'De',
    a: 'A',
    objetos: 'Objetos eliminados',
};

export const formatActividadDate = (iso) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleString('es-MX');
};

export const formatMetaValue = (value) => {
    if (value === null || value === undefined) return '—';
    if (typeof value === 'boolean') return value ? 'Sí' : 'No';
    if (Array.isArray(value)) return value.join(', ');
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
};
