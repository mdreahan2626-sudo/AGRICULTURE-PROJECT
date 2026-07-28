import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const modelPath = path.join(__dirname, 'crop-model.json');
const model = JSON.parse(fs.readFileSync(modelPath, 'utf8'));

/**
 * Predicts the crop type based on environmental and soil parameters.
 * @param {Object} inputs - The input features.
 */
export function predictCrop(inputs) {
  const { soilMapping, tree } = model;

  const formattedInputs = {
    'Temparature': Number(inputs.temperature || 0),
    'Humidity': Number(inputs.humidity || 0),
    'Moisture': Number(inputs.moisture || 0),
    'Soil Type': inputs.soilType || 'Sandy',
    'Nitrogen': Number(inputs.nitrogen || 0),
    'Potassium': Number(inputs.potassium || 0),
    'Phosphorous': Number(inputs.phosphorous || 0)
  };

  function evaluateNode(node) {
    if (node.isLeaf) {
      return node.prediction;
    }

    const feature = node.feature;
    let val = formattedInputs[feature];

    if (feature === 'Soil Type') {
      val = soilMapping[val] !== undefined ? soilMapping[val] : 0;
    }

    if (val <= node.threshold) {
      return evaluateNode(node.left);
    } else {
      return evaluateNode(node.right);
    }
  }

  return evaluateNode(tree);
}
