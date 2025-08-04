# 廣東話兒童故事及漫畫生成器 (Cantonese Children's Story & Comic Generator)

A web-based tool that allows users to create short, fun children's stories in Cantonese and visualize them as simple comic strips, all running client-side in the browser.

## Features

- Generate Cantonese children's stories from user prompts
- Visualize stories as comic strips with different styles
- Fully client-side execution with no server requirements
- Simple and intuitive user interface

## Comic Styles

- **超人風格 (Superhero Style)**: Action-packed comic style with bold colors and dynamic elements
- **漫畫風格 (Manga Style)**: Japanese-inspired comic style with expressive characters
- **卡通風格 (Cartoon Style)**: Cute and colorful cartoon style for younger audiences

## Technical Details

- Uses ChatGLM-6B (quantized to 4-bit precision) for story generation
- Transformers.js for client-side model execution
- HTML Canvas for comic panel rendering
- Pure JavaScript implementation with no external dependencies

## Setup Instructions

### Quick Start (Demo Mode)

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/cantonese-story-generator.git
   cd cantonese-story-generator
   ```

2. Start a local server:
   ```
   # Using Python
   python -m http.server 8000
   
   # Or using Node.js
   npx serve
   ```

3. Open your browser and navigate to `http://localhost:8000`

### Full Setup with AI Model

For the full experience with the actual AI model:

1. Follow the instructions in `models/chatglm-6b-int4-onnx/README.md` to download and convert the ChatGLM-6B model.

2. Modify the `model.js` file to use the actual model instead of the mock implementation:
   - Uncomment the real model loading and generation code
   - Comment out the mock implementation

3. Start a local server as described in the Quick Start section.

## System Requirements

- Modern web browser with WebAssembly support (Chrome, Firefox, Edge, Safari)
- At least 4GB of RAM for the quantized model
- Approximately 2GB of disk space for the model files

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [THUDM/ChatGLM-6B](https://github.com/THUDM/ChatGLM-6B) for the base language model
- [Xenova/transformers.js](https://github.com/xenova/transformers.js) for the client-side model execution
