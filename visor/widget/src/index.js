import { MapaMexVisor } from './element.js';


const define = (name, ctor) => {
    if (!customElements.get(name)) customElements.define(name, ctor);
};

define('mapamex-visor', MapaMexVisor);

if (typeof window !== 'undefined') {
    if (!window.mapamexVisor) window.mapamexVisor = {};
    window.mapamexVisor.version = '1.0.0';
}

export { MapaMexVisor };
