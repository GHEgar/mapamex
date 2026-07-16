import { BRAND } from '@constants/brand';
import logoVisor from '@assets/logos/visor_large_dark.svg';

export const createSidePanelHeader = (marginRight, sectionRadius) => {
    const header = document.createElement('div');
    Object.assign(header.style, {
        padding: '28px 0px',
        backgroundColor: BRAND.PRIMARY,
        borderRadius: sectionRadius,
        margin: `${marginRight}px ${marginRight}px 8px 0`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    });

    const logoImg = document.createElement('img');
    logoImg.src = logoVisor;
    Object.assign(logoImg.style, {
        width: '357px',
        height: '60px'
    });
    header.appendChild(logoImg);

    return header;
};

export const createSidePanelTitle = (title, contentWidth, sectionMargin, sectionRadius) => {
    const labelSection = document.createElement('div');
    Object.assign(labelSection.style, {
        width: `${contentWidth}px`,
        height: 'auto',
        minHeight: '106px',
        maxHeight: '160px',
        padding: '0 40px 30px 40px',
        margin: sectionMargin,
        backgroundColor: '#F1F5F9',
        borderRadius: sectionRadius,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
    });

    const titleText = document.createElement('div');

    titleText.textContent = title;

    Object.assign(titleText.style, {
        textAlign: 'left',
        font: '24px/24px system-ui, sans-serif',
        fontWeight: '800',
        letterSpacing: '0px',
        color: BRAND.NUMERALIA,
        marginTop: '17px'
    });

    labelSection.appendChild(titleText);

    return labelSection;
};
