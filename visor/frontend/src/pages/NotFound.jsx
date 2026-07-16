import { Link } from 'react-router';
import imgLupa from '@assets/images/img_lupa.svg';
import SEO from '@components/SEO';

const NotFound = () => {
    return (
        <>
            <SEO
                title="Página no encontrada | Visor"
                description="La página que buscas no existe en Visor del MapaMex."
                noindex
            />
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FCE7F0 100%)' }}>
                <img src={imgLupa} alt="Página no encontrada" className="w-64 md:w-80 mb-8" />
                <h1 className="font-sans font-bold text-[28px]/[40px] md:text-[40px]/[56px] text-numeralia tracking-normal mb-8">
                No encontramos la página<br />que estás buscando...
                </h1>
                <Link
                    to="/"
                    className="px-10 py-3 bg-primary-deep text-white rounded-2xl hover:bg-primary hover:shadow-lg transition font-sans font-bold text-sm"
                >
                Regresar al inicio
                </Link>
            </div>
        </>
    );
};

export default NotFound;
