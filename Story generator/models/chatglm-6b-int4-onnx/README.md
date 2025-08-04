# ChatGLM-6B Model Files

This directory is where the ChatGLM-6B model files in ONNX format should be placed.

## How to Download and Convert the Model

1. Download the quantized model from Hugging Face:
   ```
   git lfs install
   git clone https://huggingface.co/THUDM/chatglm-6b-int4
   ```

2. Install the required conversion tools:
   ```
   pip install optimum
   ```

3. Convert the model to ONNX format:
   ```
   optimum-cli export onnx --model THUDM/chatglm-6b-int4 --task text-generation ./chatglm-6b-int4-onnx
   ```

4. Copy all the generated ONNX files to this directory.

## Note for MVP

For the MVP version, we're using a mock implementation in the code to simulate the model's behavior. The actual model integration will be implemented in a future version.
