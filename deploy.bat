@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ============================================
echo   Mizu Phone - 部署
echo ============================================
echo.

set /p NOTES="请输入本次更新说明（多条用分号 ; 分隔，直接回车跳过）: "
if "!NOTES!"=="" set "NOTES=日常更新"

echo.
echo [1/2] 生成版本号...
node -e "const fs=require('fs');const now=new Date();const v='v'+now.getFullYear()+String(now.getMonth()+1).padStart(2,'0')+String(now.getDate()).padStart(2,'0')+'_'+String(now.getHours()).padStart(2,'0')+String(now.getMinutes()).padStart(2,'0');const notes=(process.env.NOTES||'日常更新').split(';').map(s=>s.trim()).filter(Boolean);fs.writeFileSync('version.json',JSON.stringify({current:v,buildTime:now.toISOString(),versions:[{version:v,date:now.toISOString().split('T')[0],notes,critical:false}]},null,2));console.log('[deploy] version:',v);console.log('[deploy] notes:',notes.join(' | '));"

echo [2/2] 上传到 Cloudflare...
wrangler pages deploy . --project-name=mizuphone-test --commit-dirty=true

echo.
echo ============================================
echo   部署完成！
echo ============================================
pause
endlocal