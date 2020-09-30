import cache from '../cache.js'
import objects from '../objects.js';


const calculate = () => {
    let svgUpdate = [];
    const currentPhase = cache.currentPhase;
    const currentPhaseData = objects.phases.find((phase) => phase.number === currentPhase);
    console.log(currentPhaseData);
    const elementToShow = currentPhaseData.svgShowOnTransitionId;
    console.log(elementToShow);
    svgUpdate.push({ id: elementToShow })

    return svgUpdate;
}

export default calculate;