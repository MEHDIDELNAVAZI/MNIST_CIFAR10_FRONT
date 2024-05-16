from flask import Flask, request, jsonify
import cv2
import numpy as np
import base64
from tensorflow.keras.models import load_model
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load the MNIST model
model_mnist = load_model('mnist_cnn_model.h5')
model_CIFAR10 = load_model('cifar10_cnn_model.h5')

@app.route('/mnist_predict', methods=['POST'])
def mnist_predict():
    # Check if the POST request has a file attached
    if 'image' not in request.files:
        return jsonify({'error': 'No image found in the request'}), 400

    file = request.files['image']
    
    # Check if the file is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Read the image
    image = cv2.imdecode(np.frombuffer(file.read(), np.uint8), cv2.IMREAD_COLOR)

    # Resize the image to 28x28 pixels
    image_resized = cv2.resize(image, (28, 28))

    # Convert resized image to grayscale
    image_gray = cv2.cvtColor(image_resized, cv2.COLOR_BGR2GRAY)

    # Preprocess the image
    image_gray = image_gray.reshape(-1, 28, 28, 1)
    image_gray = image_gray.astype('float32') / 255.0

    # Make prediction
    prediction = model_mnist.predict(image_gray)

    # Decode image to base64
    _, buffer = cv2.imencode('.png', image_resized)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    # Return the prediction and the image
    return jsonify({'prediction': int(np.argmax(prediction)), 'image_base64': image_base64})



@app.route('/cifar10_predict', methods=['POST'])
def cifar10_predict():
    # Check if the POST request has a file attached
    if 'image' not in request.files:
        return jsonify({'error': 'No image found in the request'}), 400

    file = request.files['image']
    
    # Check if the file is empty
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    # Read the image
    image = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(image, cv2.IMREAD_COLOR)

    # Check if the image is read correctly
    if image is None:
        return jsonify({'error': 'Unable to read the image'}), 400

    # Resize the image to 32x32 pixels
    image_resized = cv2.resize(image, (32, 32))

    # Preprocess the image
    image_preprocessed = image_resized.astype('float32') / 255.0
    image_preprocessed = np.expand_dims(image_preprocessed, axis=0)  # Add batch dimension

    # Make prediction
    prediction = model_CIFAR10.predict(image_preprocessed)
    predicted_class = int(np.argmax(prediction))

    # Encode image to base64
    _, buffer = cv2.imencode('.png', image_resized)
    image_base64 = base64.b64encode(buffer).decode('utf-8')

    # Return the prediction and the image
    return jsonify({'prediction': predicted_class, 'image_base64': image_base64})

if __name__ == '__main__':
    app.run(port=9001, debug=True)
