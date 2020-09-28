import executeQuery from '../sql/executeQuery.js'
import cache from '../cache.js'
import objects from '../objects.js';


const calculate = async () => {
    let svgUpdate = [];
    const variables = await executeQuery('getData', 'variables');
    cache.variables = variables;
    console.log(variables);

    // ---- STORE DELIVERIES ----

    const peakWeekAP = variables.find((variable) => variable.name === 'peak week AP');
    const initialGrowth = variables.find((variable) => variable.name === 'Growth');
    console.log(objects.periods[cache.currentPeriod])
    const growth = (initialGrowth.value + 1) ** objects.periods[cache.currentPeriod];
    const weeklyHours = variables.find((variable) => variable.name === 'Weekly hours');
    const hourlySurge = variables.find((variable) => variable.name === 'Hourly surge');
    const unitsPerHour = peakWeekAP.value * growth / weeklyHours.value * hourlySurge.value;
    const palletStoreCases = variables.find((variable) => variable.name === 'Pallet store cases');

    svgUpdate.push({ id: 'peakWeekAP', value: peakWeekAP.value });
    svgUpdate.push({ id: 'growth', value: `${initialGrowth.value * 100}%` });
    svgUpdate.push({ id: 'weeklyHours', value: weeklyHours.value });
    svgUpdate.push({ id: 'hourlySurge', value: `${(hourlySurge.value.toFixed(2) - 1) * 100}%` });
    svgUpdate.push({ id: 'unitsPerHour', value: unitsPerHour });
    svgUpdate.push({ id: 'palletStoreCases1', value: palletStoreCases.value });
    svgUpdate.push({ id: 'palletStoreCases2', value: palletStoreCases.value });


    // ---- E_COMM non weekend ----

    const peakNonWeekendUnitsOrdered = variables.find((variable) => variable.name === 'Peak non weekend units ordered');
    const ecommHours = variables.find((variable) => variable.name === 'ecomm hours');
    const ecommGrowth = variables.find((variable) => variable.name === 'ecomm growth');
    const ecommLinesPerHour = peakNonWeekendUnitsOrdered.value / ecommHours.value * (1 + ecommGrowth.value);

    svgUpdate.push({ id: 'peakNonWeekendUnitsOrdered', value: peakNonWeekendUnitsOrdered.value });
    svgUpdate.push({ id: 'ecommHours', value: ecommHours.value });
    svgUpdate.push({ id: 'ecommGrowth', value: `${ecommGrowth.value * 100}%` });
    // // svgUpdate.push({ id: 'ecommLinesPerHour', value: ecommLinesPerHour.toFixed(2) });


    // ---- E-COMM weekend ----

    const GTPsPerSide = variables.find((variable) => variable.name === 'GTPs per side');
    const ratePerGTP = variables.find((variable) => variable.name === 'Rate per GTP');
    const gtpSideCasesPerHour = GTPsPerSide.value * ratePerGTP.value;

    svgUpdate.push({ id: 'GTPsPerSide1', value: GTPsPerSide.value });
    svgUpdate.push({ id: 'GTPsPerSide2', value: GTPsPerSide.value });
    svgUpdate.push({ id: 'ratePerGTP', value: ratePerGTP.value });
    svgUpdate.push({ id: 'gtpSideCasesPerHour1', value: gtpSideCasesPerHour.toFixed(0) });
    svgUpdate.push({ id: 'gtpSideCasesPerHour2', value: gtpSideCasesPerHour.toFixed(0) });


    // ---- GENERAL ----

    const sideImbalance = variables.find((variable) => variable.name === 'Side imbalance');

    svgUpdate.push({ id: 'sideImbalance', value: `${Math.round((sideImbalance.value - 1) * 100)}%` });
    // svgUpdate.push({ id: 'sideImbalance', value: `${(sideImbalance.value - 1) * 100}%` });

    // ---- INBOUND ----

    const averageWeekAP = variables.find((variable) => variable.name === 'Average week AP');
    const receivingPeakToAvg = variables.find((variable) => variable.name === 'receiving peak to avg');
    const unitsPerCase = variables.find((variable) => variable.name === 'units per case');
    const receivingToAPperSide = averageWeekAP.value * receivingPeakToAvg.value * growth / weeklyHours.value * hourlySurge.value / unitsPerCase.value * sideImbalance.value / 2;

    svgUpdate.push({ id: 'averageWeekAP', value: averageWeekAP.value });
    svgUpdate.push({ id: 'receivingPeakToAvg', value: receivingPeakToAvg.value });
    svgUpdate.push({ id: 'unitsPerCase', value: unitsPerCase.value });
    svgUpdate.push({ id: 'receivingToAPperSide1', value: receivingToAPperSide.toFixed(0) });
    svgUpdate.push({ id: 'receivingToAPperSide2', value: receivingToAPperSide.toFixed(0) });

    // ---- STORE PICKING ----

    const unitsPerShuttleOutMove = variables.find((variable) => variable.name === 'units per shuttle out move');
    const unitsPerShuttleInMove = variables.find((variable) => variable.name === 'units per shuttle in move');
    const shuttleRetrieveToSupportAP = unitsPerHour / unitsPerShuttleOutMove.value;
    const shuttlePutawayToSupportAP = unitsPerHour / unitsPerShuttleInMove.value;
    const oneSideShuttleConveyorToInduct = (shuttleRetrieveToSupportAP - shuttlePutawayToSupportAP) / 2 * sideImbalance.value;
    const oneSideShuttleConveyorToFromInduct = shuttlePutawayToSupportAP / 2 * sideImbalance.value;

    svgUpdate.push({ id: 'unitsPerShuttleOutMove', value: unitsPerShuttleOutMove.value });
    svgUpdate.push({ id: 'unitsPerShuttleInMove', value: unitsPerShuttleInMove.value });
    // // svgUpdate.push({ id: 'shuttleRetrieveToSupportAP', value: shuttleRetrieveToSupportAP.toFixed(2) });
    // // svgUpdate.push({ id: 'shuttlePutawayToSupportAP', value: shuttlePutawayToSupportAP.toFixed(2) });
    svgUpdate.push({ id: 'oneSideShuttleConveyorToInduct1', value: oneSideShuttleConveyorToInduct.toFixed(0) });
    svgUpdate.push({ id: 'oneSideShuttleConveyorToInduct2', value: oneSideShuttleConveyorToInduct.toFixed(0) });
    svgUpdate.push({ id: 'oneSideShuttleConveyorToFromInduct1', value: oneSideShuttleConveyorToFromInduct.toFixed(0) });
    svgUpdate.push({ id: 'oneSideShuttleConveyorToFromInduct2', value: oneSideShuttleConveyorToFromInduct.toFixed(0) });

    // ---- SHUTTLE ----

    const shuttleIn = shuttlePutawayToSupportAP + receivingToAPperSide + ecommLinesPerHour;
    const shuttleOut = shuttleRetrieveToSupportAP + ecommLinesPerHour;
    const shuttleSize = variables.find((variable) => variable.name === 'Shuttle size');

    svgUpdate.push({ id: 'shuttleIn', value: shuttleIn.toFixed(0) });
    svgUpdate.push({ id: 'shuttleOut', value: shuttleOut.toFixed(0) });
    svgUpdate.push({ id: 'shuttleSize', value: shuttleSize.value });

    // ---- SORTER ----

    const sorterEach = unitsPerHour / 2 * sideImbalance.value;
    const chutes = variables.find((variable) => variable.name === 'Chutes');
    const sorterCasesOut = variables.find((variable) => variable.name === 'Sorter cases out');

    svgUpdate.push({ id: 'sorterEach1', value: sorterEach.toFixed(0) });
    svgUpdate.push({ id: 'sorterEach2', value: sorterEach.toFixed(0) });
    svgUpdate.push({ id: 'chutes1', value: chutes.value });
    svgUpdate.push({ id: 'chutes2', value: chutes.value });
    svgUpdate.push({ id: 'sorterCasesOut1', value: sorterCasesOut.value });
    svgUpdate.push({ id: 'sorterCasesOut2', value: sorterCasesOut.value });

    // ---- SHIPPING ----

    const peakCasesPeakWeek = variables.find((variable) => variable.name === 'peak cases peak week');
    const peakHourCases = peakCasesPeakWeek.value * growth / weeklyHours.value * hourlySurge.value;
    const percentToBuffer = variables.find((variable) => variable.name === '% to buffer');
    const peakBufferDualCycles = peakHourCases * percentToBuffer.value;
    const percentOfWeekInBuffer = variables.find((variable) => variable.name === '% of week in buffer');
    const bufferSize = peakCasesPeakWeek.value * growth * percentOfWeekInBuffer.value * percentToBuffer.value;
    const brightLoadingDoors = variables.find((variable) => variable.name === 'Bright loading doors');

    // // svgUpdate.push({ id: 'peakCasesPeakWeek', value: peakCasesPeakWeek.value.toFixed(2) });
    // // svgUpdate.push({ id: 'peakHourCases', value: peakHourCases.toFixed(2) });
    svgUpdate.push({ id: 'percentToBuffer', value: `${(percentToBuffer.value * 100).toFixed(0)}%` });
    svgUpdate.push({ id: 'peakBufferDualCycles1', value: peakBufferDualCycles.toFixed(0) });
    svgUpdate.push({ id: 'peakBufferDualCycles2', value: peakBufferDualCycles.toFixed(0) });
    svgUpdate.push({ id: 'peakBufferDualCycles3', value: peakBufferDualCycles.toFixed(0) });
    svgUpdate.push({ id: 'peakBufferDualCycles4', value: peakBufferDualCycles.toFixed(0) });
    svgUpdate.push({ id: 'percentOfWeekInBuffer', value: `${percentOfWeekInBuffer.value * 100}%` });
    svgUpdate.push({ id: 'bufferSize', value: bufferSize.toFixed(0) });
    svgUpdate.push({ id: 'brightLoadingDoors1', value: brightLoadingDoors.value });
    svgUpdate.push({ id: 'brightLoadingDoors2', value: brightLoadingDoors.value });

    // // ---- RELAY ----

    const peakCasesPerWeekRelay = variables.find((variable) => variable.name === 'peak cases per week relay');
    const peakHourRelay = peakCasesPerWeekRelay.value * growth / weeklyHours.value * hourlySurge.value;

    svgUpdate.push({ id: 'peakCasesPerWeekRelay', value: peakCasesPerWeekRelay.value });
    // svgUpdate.push({ id: 'peakHourRelay', value: peakHourRelay.toFixed(2) });

    // // ---- UPS ----

    // const upsLoadingDoors = variables.find((variable) => variable.name === 'UPS loading doors');

    // svgUpdate.push({ id: 'upsLoadingDoors', value: upsLoadingDoors.value.toFixed(2) });

    return svgUpdate;
}

export default calculate;