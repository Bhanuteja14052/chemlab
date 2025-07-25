@echo off
cd /d "E:\Myche-lab(FSD)\myche-lab"
if exist .next rmdir /s /q .next
npm run dev
pause
