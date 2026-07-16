import { useEffect } from 'react';
import { BRAND } from '@constants/brand';

const useThemeColor = (color) => {
    useEffect(() => {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = color;
        return () => { if (meta) meta.content = BRAND.PRIMARY; };
    }, [color]);
};

export default useThemeColor;
