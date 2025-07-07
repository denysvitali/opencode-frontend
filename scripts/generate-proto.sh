#!/bin/bash

# Generate TypeScript types from protobuf files
set -e

PROTO_DIR="src/proto"
OUT_DIR="src/generated"

# Create output directory
mkdir -p $OUT_DIR

# Check if protoc is available
if ! command -v protoc &> /dev/null; then
    echo "protoc is not installed. Installing..."
    # Install protoc
    PROTOC_VERSION="25.1"
    PROTOC_ZIP="protoc-${PROTOC_VERSION}-linux-x86_64.zip"
    curl -OL https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOC_VERSION}/${PROTOC_ZIP}
    sudo unzip -o $PROTOC_ZIP -d /usr/local bin/protoc
    sudo unzip -o $PROTOC_ZIP -d /usr/local 'include/*'
    rm -f $PROTOC_ZIP
fi

# Clean output directory
rm -rf $OUT_DIR
mkdir -p $OUT_DIR

# Generate TypeScript types using grpc-web
echo "Generating TypeScript types from protobuf files..."

# Generate for orchestrator service
protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-grpc-web=./node_modules/.bin/protoc-gen-grpc-web \
  --ts_out=import_style=commonjs:$OUT_DIR/orchestrator \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR/orchestrator \
  --proto_path=$PROTO_DIR \
  --proto_path=/usr/local/include \
  $PROTO_DIR/orchestrator/v1/orchestrator.proto

# Generate for opencode service  
protoc \
  --plugin=protoc-gen-ts=./node_modules/.bin/protoc-gen-ts \
  --plugin=protoc-gen-grpc-web=./node_modules/.bin/protoc-gen-grpc-web \
  --ts_out=import_style=commonjs:$OUT_DIR/opencode \
  --grpc-web_out=import_style=typescript,mode=grpcwebtext:$OUT_DIR/opencode \
  --proto_path=$PROTO_DIR \
  --proto_path=/usr/local/include \
  $PROTO_DIR/v1/common.proto \
  $PROTO_DIR/v1/opencode_service.proto

echo "TypeScript types generated successfully in $OUT_DIR"
