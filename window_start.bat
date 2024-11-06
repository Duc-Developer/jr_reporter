@echo off
if not exist "node_modules" (
    echo "node_modules folder not found. Installing dependencies..."
    npm install
)
echo Starting the project...
npm run dev
pause