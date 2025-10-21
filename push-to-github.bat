@echo off
echo ================================================
echo Pushing Aquarium Tycoon to GitHub
echo ================================================
echo.

cd /d "%~dp0"

echo Step 1: Adding remote repository...
git remote add origin https://github.com/LegendaryDrogan/Aquarium-Tycoon.git

echo.
echo Step 2: Renaming branch to main...
git branch -M main

echo.
echo Step 3: Pushing to GitHub...
echo (You may need to enter your GitHub credentials)
git push -u origin main

echo.
echo ================================================
echo Done! Your game is now on GitHub!
echo Visit: https://github.com/LegendaryDrogan/Aquarium-Tycoon
echo ================================================
pause
