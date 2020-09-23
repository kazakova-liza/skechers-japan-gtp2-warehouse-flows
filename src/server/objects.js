import getOrders from './phases/getOrders.js'
import findPossibleCartons from './phases/findPossibleCartons.js'
import listEligibleStyleColor from './phases/listEligibleStyleColor.js'
import splitCartons from './phases/splitCartons.js'
import affinityPrep from './phases/affinityPrep.js'
import affinityGroup from './phases/affinityGroup.js'
import getInventory from './phases/getInventory.js'
import invFromSlow from './phases/invfromSlow.js'
import makeReplens from './phases/makeReplens.js'
import assignInventory from './phases/assignInventory.js'
import invToSlow from './phases/invToSlow.js'

const objects = {
    "inputs": [
        {
            "name": "Orders table",
            "type": "text"
        },
        {
            "name": "Groups",
            "type": "text"
        },
        {
            "name": "Move to slow",
            "type": "text"
        },
    ],
    groups: 120,
    daysbeforeArchiveToSlow: 30,
    phases: [
        {
            number: 1,
            name: 'getOrders',
            function: getOrders,
            textOnProcessing: "getting orders",
            textOnCompletion: "got orders",
            async: true,
            svgTransitionElementId: undefined,

        },
        {
            number: 2,
            name: 'findPossibleCartons',
            function: findPossibleCartons,
            textOnProcessing: "finding possible cartons",
            textOnCompletion: "found possible cartons",
            svgTransitionElementId: 'svg_18',
        },
        {
            number: 3,
            name: 'listEligibleStyleColor',
            function: listEligibleStyleColor,
            textOnProcessing: "finding eligible style/colors",
            textOnCompletion: "found eligible style/colors",
            svgTransitionElementId: 'svg_32',
        },
        {
            number: 4,
            name: splitCartons,
            function: splitCartons,
            textOnProcessing: "splitting cartons",
            textOnCompletion: "split cartons",
            svgTransitionElementId: 'svg_41',
        },
        {
            number: 5,
            name: affinityPrep,
            function: affinityPrep,
            textOnProcessing: "creating affinity matrix",
            textOnCompletion: "affinity martrix ready",
            svgTransitionElementId: 'svg_73',
        },
        {
            number: 6,
            name: affinityGroup,
            function: affinityGroup,
            textOnProcessing: "creating affinity groups",
            textOnCompletion: "affinity groups ready",
            svgTransitionElementId: 'svg_20',
        },
        {
            number: 7,
            name: getInventory,
            function: getInventory,
            textOnProcessing: "getting current inventory",
            textOnCompletion: "got current inventory",
            svgTransitionElementId: 'svg_42',
        },
        {
            number: 8,
            name: invFromSlow,
            function: invFromSlow,
            textOnProcessing: "getting inventory from slow",
            textOnCompletion: "got inventory from slow",
            svgTransitionElementId: 'svg_105',
        },
        {
            number: 9,
            name: makeReplens,
            function: makeReplens,
            textOnProcessing: "calculating what needs replenishment",
            textOnCompletion: "calculated what needs replenishment",
            svgTransitionElementId: 'svg_82',
        },
        {
            number: 10,
            name: assignInventory,
            function: assignInventory,
            textOnProcessing: "assigning inventory for cartons",
            textOnCompletion: "assigned inventory for cartons",
            svgTransitionElementId: 'svg_85',
        },
        {
            number: 11,
            name: invToSlow,
            function: invToSlow,
            textOnProcessing: "putting slow inventory away",
            textOnCompletion: "put slow inventory away",
            svgTransitionElementId: undefined,
        }
    ]
}

export default objects;