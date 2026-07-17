---
name: compile-whisper-cpp-wasm
description: Guide to compiling whisper.cpp to WebAssembly for browser usage.
---
# Compile whisper.cpp to WASM

1. **Setup Emscripten:** Ensure Emscripten is installed and activated via `emsdk`.
2. **Build Configuration:** Use the whisper.cpp Makefile or CMake setup with Emscripten toolchain.
3. **Web Worker Wrapper:** Ensure the generated JS exposes the necessary module loading. Create a Web Worker to instantiate the WASM module to avoid blocking the UI thread.
4. **Memory constraints:** Configure Emscripten memory settings appropriately (e.g., `-s ALLOW_MEMORY_GROWTH=1`).
5. **Exit criteria:** A working WASM module that accepts audio buffer and returns a transcript.
