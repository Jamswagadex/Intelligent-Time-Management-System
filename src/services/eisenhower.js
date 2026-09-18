/**
 * Eisenhower Matrix classification.
 * Quadrant is derived automatically from importance & urgency flags.
 */
function classify(importance, urgency) {
  if (importance && urgency)  return { quadrant: 1, action: 'DO FIRST',        label: 'Urgent + Important' };
  if (importance && !urgency) return { quadrant: 2, action: 'SCHEDULE',        label: 'Not Urgent + Important' };
  if (!importance && urgency) return { quadrant: 3, action: 'DELEGATE',        label: 'Urgent + Not Important' };
  return                             { quadrant: 4, action: 'DELETE/MINIMIZE', label: 'Not Urgent + Not Important' };
}

module.exports = { classify };
