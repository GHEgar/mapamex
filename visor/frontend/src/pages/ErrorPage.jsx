import { useRouteError, Link } from 'react-router';
import imgLupa from '@assets/images/img_lupa.svg';

const ErrorPage = ({ title: titleProp, description }) => {
    const routeError = useRouteError();

    if (routeError) {
        console.error('Error capturado por React Router:', routeError);
    }

    const is404 = !titleProp && routeError?.status === 404;

    const title = titleProp ?? (is404
        ? 'No encontramos la página\nque estás buscando...'
        : 'Algo salió mal...');

    return (
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #FCE7F0 100%)' }}>
            <img src={imgLupa} alt="Error" className="w-64 md:w-80 mb-8" />
            <h1 className="font-sans font-bold text-[28px]/[40px] md:text-[40px]/[56px] text-numeralia tracking-normal mb-4 whitespace-pre-line">
                {title}
            </h1>
            {description && (
                <p className="font-sans text-base md:text-lg text-numeralia max-w-xl mb-4 whitespace-pre-line">
                    {description}
                </p>
            )}
            <div className="flex flex-col w-full md:w-auto md:flex-row gap-4 mt-4">
                <Link
                    to="/"
                    className="px-10 py-3 bg-primary-deep text-white rounded-2xl hover:bg-primary hover:shadow-lg transition font-sans font-bold text-sm"
                >
                    Regresar al inicio
                </Link>
                {!is404 && (
                    <button
                        onClick={() => window.location.reload()}
                        className="px-10 py-3 border border-primary-deep text-primary-deep rounded-2xl hover:bg-primary-deep hover:text-white transition font-sans font-bold text-sm"
                    >
                        Recargar página
                    </button>
                )}
            </div>
        </div>
    );
};

export default ErrorPage;
