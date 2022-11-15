// Shared utility functions

/**
 * 
 * @param {d3.Selection} selection 
 * @returns {DOMRect} 
 */
export function getDimensions(selection) {
    return selection.node().getBoundingClientRect()
}

