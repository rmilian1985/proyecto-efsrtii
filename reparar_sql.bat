@echo off
echo =====================================================================
echo  REPARANDO Y ARRANCANDO SQL SERVER
echo =====================================================================
echo.
reg add "HKLM\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL17.MSSQLSERVER\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled /t REG_DWORD /d 0 /f
reg add "HKLM\SOFTWARE\Microsoft\MSSQLServer\MSSQLServer\SuperSocketNetLib\Tcp" /v Enabled /t REG_DWORD /d 0 /f
echo.
echo Iniciando servicio SQL Server...
net start MSSQLSERVER
echo.
echo Si dice 'El servicio se ha iniciado con exito', ya puedes abrir SSMS.
pause
