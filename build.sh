#!/bin/bash
set -e

echo "========================================"
echo "Building Web Democracy Frontend"
echo "========================================"

cd frontend

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi

# Build the frontend
echo "Building frontend with react-scripts..."
npm run build

# Copy build output to backend/static
echo "Copying build files to backend/static/..."
cd ..
rm -rf backend/static
mkdir -p backend/static

# Copy all files from build/ to backend/static/
cp -r frontend/build/* backend/static/

# The structure is now flat:
# backend/static/index.html
# backend/static/static/js/  <- nested static folder from React
# backend/static/static/css/

echo "Flattening nested static folder..."
# Move contents of backend/static/static/ up one level
if [ -d "backend/static/static" ]; then
    # Move js and css folders up one level
    mv backend/static/static/js backend/static/ 2>/dev/null || true
    mv backend/static/static/css backend/static/ 2>/dev/null || true
    # Remove the now-empty nested static folder
    rmdir backend/static/static 2>/dev/null || true
fi

echo ""
echo "========================================"
echo "✅ Build complete!"
echo "========================================"
echo "Frontend static files are in backend/static/"
echo ""
echo "Next steps:"
echo "  1. Validate: databricks bundle validate -t dev"
echo "  2. Deploy:   databricks bundle deploy -t dev"
echo "  3. Run:      databricks bundle run webdemocracy_app -t dev"
echo "========================================"

