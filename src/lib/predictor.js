import model from './crop-model.json'

/**
 * Predicts the crop type based on environmental and soil parameters.
 * @param {Object} inputs - The input features.
 * @param {number} inputs.Temparature - Temperature in Celsius.
 * @param {number} inputs.Humidity - Humidity percentage.
 * @param {number} inputs.Moisture - Soil moisture percentage.
 * @param {string} inputs.SoilType - Soil Type ('Sandy', 'Loamy', 'Black', 'Red', 'Clayey').
 * @param {number} inputs.Nitrogen - Nitrogen level in soil.
 * @param {number} inputs.Potassium - Potassium level in soil.
 * @param {number} inputs.Phosphorous - Phosphorous level in soil.
 * @returns {string} The predicted crop type.
 */
export function predictCrop(inputs) {
  const { soilMapping, tree } = model

  // Map incoming SoilType to the field name in model: "Soil Type"
  const formattedInputs = {
    'Temparature': Number(inputs.temperature || inputs.Temparature || 0),
    'Humidity': Number(inputs.humidity || inputs.Humidity || 0),
    'Moisture': Number(inputs.moisture || inputs.Moisture || 0),
    'Soil Type': inputs.soilType || inputs.SoilType || 'Sandy',
    'Nitrogen': Number(inputs.nitrogen || inputs.Nitrogen || 0),
    'Potassium': Number(inputs.potassium || inputs.Potassium || 0),
    'Phosphorous': Number(inputs.phosphorous || inputs.Phosphorous || 0)
  }

  function evaluateNode(node) {
    if (node.isLeaf) {
      return node.prediction
    }

    const feature = node.feature
    let val = formattedInputs[feature]

    // Encode Soil Type if that's the split feature
    if (feature === 'Soil Type') {
      val = soilMapping[val] !== undefined ? soilMapping[val] : 0
    }

    if (val <= node.threshold) {
      return evaluateNode(node.left)
    } else {
      return evaluateNode(node.right)
    }
  }

  return evaluateNode(tree)
}
