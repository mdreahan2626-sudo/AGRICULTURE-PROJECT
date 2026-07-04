import os
import json
import pandas as pd
from sklearn.tree import DecisionTreeClassifier

def serialize_tree(tree_model, feature_names, class_names, node_id=0):
    tree = tree_model.tree_
    if tree.feature[node_id] == -2:  # -2 means leaf node in scikit-learn
        class_idx = tree.value[node_id].argmax()
        return {
            "isLeaf": True,
            "prediction": str(class_names[class_idx])
        }
    else:
        feature_idx = tree.feature[node_id]
        feature_name = feature_names[feature_idx]
        threshold = float(tree.threshold[node_id])
        left_child = int(tree.children_left[node_id])
        right_child = int(tree.children_right[node_id])
        return {
            "isLeaf": False,
            "feature": feature_name,
            "threshold": threshold,
            "left": serialize_tree(tree_model, feature_names, class_names, left_child),
            "right": serialize_tree(tree_model, feature_names, class_names, right_child)
        }

def main():
    csv_path = 'data_core.csv'
    if not os.path.exists(csv_path):
        print(f"Error: {csv_path} not found.")
        return

    # Load dataset
    df = pd.read_csv(csv_path)

    # Encode categorical feature Soil Type
    soil_mapping = {'Sandy': 0, 'Loamy': 1, 'Black': 2, 'Red': 3, 'Clayey': 4}
    df['Soil_Encoded'] = df['Soil Type'].map(soil_mapping)

    # Features and Target
    feature_cols = ['Temparature', 'Humidity', 'Moisture', 'Soil_Encoded', 'Nitrogen', 'Potassium', 'Phosphorous']
    X = df[feature_cols]
    y = df['Crop Type']

    # Get class names
    class_names = y.astype('category').cat.categories.tolist()

    # Train Decision Tree
    clf = DecisionTreeClassifier(max_depth=10, random_state=42)
    clf.fit(X, y)

    # Check accuracy
    train_acc = clf.score(X, y)
    print(f"Model trained. Training accuracy: {train_acc:.4f}")

    # Serialize Model
    # Map the encoded column name back to the user-friendly name for client-side matching
    display_feature_names = ['Temparature', 'Humidity', 'Moisture', 'Soil Type', 'Nitrogen', 'Potassium', 'Phosphorous']
    serialized_tree = serialize_tree(clf, display_feature_names, class_names, 0)

    model_metadata = {
        "features": display_feature_names,
        "soilMapping": soil_mapping,
        "tree": serialized_tree
    }

    # Ensure output dir exists
    os.makedirs('src/lib', exist_ok=True)
    
    # Save to JSON
    with open('src/lib/crop-model.json', 'w') as f:
        json.dump(model_metadata, f, indent=2)

    print("Model serialized and saved to src/lib/crop-model.json")

if __name__ == '__main__':
    main()
