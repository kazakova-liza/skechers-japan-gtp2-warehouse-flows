import calculate from './phases/calculations.js'

const objects = {
    inputs: [
        {
            name: "Variables table",
            type: "text"
        },
    ],
    phases: [
        {
            number: 1,
            name: 'calculations',
            function: calculate,
            textOnProcessing: "calculating variables",
            textOnCompletion: "variables calculated",
            async: false,
            svgTransitionElementId: undefined,
        }
    ],
    periods: [1, 2, 3, 4, 5, 6, 7]
}

export default objects;