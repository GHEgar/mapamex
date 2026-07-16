import { formatNumber } from '@pages/maps/helpers/formatNumber';
import { EXPORT_DIMENSIONS } from './exportDimensions';

const formatUTMCoordinate = (value) => `${formatNumber((value / 1000).toFixed(0))} km`;

const {
    NUM_DIVISIONS_X,
    NUM_DIVISIONS_Y,
    FRAME_COLOR,
    COORDINATE_LABEL_WIDTH,
    COORDINATE_LABEL_HEIGHT
} = EXPORT_DIMENSIONS;

const createHorizontalLabel = (text, fraction) => {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        position: 'absolute',
        left: `${fraction * 100}%`,
        top: '0',
        height: '100%',
        transform: 'translateX(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    const label = document.createElement('div');
    label.textContent = text;
    Object.assign(label.style, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: FRAME_COLOR,
        whiteSpace: 'nowrap'
    });

    wrapper.appendChild(label);
    return wrapper;
};

const createVerticalLabel = (text, fraction) => {
    const wrapper = document.createElement('div');
    Object.assign(wrapper.style, {
        position: 'absolute',
        top: `${fraction * 100}%`,
        left: '0',
        width: '100%',
        transform: 'translateY(-50%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    });

    const label = document.createElement('div');
    label.textContent = text;
    Object.assign(label.style, {
        fontFamily: 'system-ui, sans-serif',
        fontSize: '16px',
        color: FRAME_COLOR,
        whiteSpace: 'nowrap',
        transform: 'rotate(-90deg)'
    });

    wrapper.appendChild(label);
    return wrapper;
};

const coordinateLabels = (mapAreaWidth, mapAreaHeight, utmExtent = null) => {
    const topLabelsContainer = document.createElement('div');
    Object.assign(topLabelsContainer.style, {
        position: 'relative',
        width: `${mapAreaWidth}px`,
        height: `${COORDINATE_LABEL_HEIGHT}px`,
        boxSizing: 'border-box'
    });

    const bottomLabelsContainer = document.createElement('div');
    Object.assign(bottomLabelsContainer.style, {
        position: 'relative',
        width: `${mapAreaWidth}px`,
        height: `${COORDINATE_LABEL_HEIGHT * 4}px`,
        boxSizing: 'border-box'
    });

    const leftLabelsContainer = document.createElement('div');
    Object.assign(leftLabelsContainer.style, {
        position: 'relative',
        width: `${COORDINATE_LABEL_WIDTH}px`,
        height: `${mapAreaHeight}px`,
        boxSizing: 'border-box'
    });

    const rightLabelsContainer = document.createElement('div');
    Object.assign(rightLabelsContainer.style, {
        position: 'relative',
        width: `${COORDINATE_LABEL_WIDTH}px`,
        height: `${mapAreaHeight}px`,
        boxSizing: 'border-box'
    });

    if (utmExtent) {
        const [minEasting, minNorthing, maxEasting, maxNorthing] = utmExtent;
        const eastingRange = maxEasting - minEasting;
        const northingRange = maxNorthing - minNorthing;

        for (let i = 1; i < NUM_DIVISIONS_X; i++) {
            const easting = minEasting + (i / NUM_DIVISIONS_X) * eastingRange;
            const text = formatUTMCoordinate(easting);
            const fraction = i / NUM_DIVISIONS_X;
            topLabelsContainer.appendChild(createHorizontalLabel(text, fraction));
            bottomLabelsContainer.appendChild(createHorizontalLabel(text, fraction));
        }

        for (let j = 1; j < NUM_DIVISIONS_Y; j++) {
            const northing = maxNorthing - (j / NUM_DIVISIONS_Y) * northingRange;
            const text = formatUTMCoordinate(northing);
            const fraction = j / NUM_DIVISIONS_Y;
            leftLabelsContainer.appendChild(createVerticalLabel(text, fraction));
            rightLabelsContainer.appendChild(createVerticalLabel(text, fraction));
        }
    }

    return {
        top: topLabelsContainer,
        bottom: bottomLabelsContainer,
        left: leftLabelsContainer,
        right: rightLabelsContainer
    };
};

export default coordinateLabels;
