@echo off
echo SmartCart Plus - Installation Script
echo ====================================
echo.

echo Step 1: Navigating to project directory...
cd /d "d:\CMW [''-'']\Documents\NIBM HDSE\PDSA\Project"

echo Step 2: Installing npm dependencies...
npm install

echo Step 3: Installation complete!
echo.
echo To start the development server, run:
echo npm run dev
echo.
echo Then open your browser to: http://localhost:3000
pause