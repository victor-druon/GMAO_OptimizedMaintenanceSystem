Set objExcel = CreateObject("Excel.Application")
objExcel.Visible = False  ' Empêche l'ouverture de la fenêtre Excel
Set objWorkbook = objExcel.Workbooks.Open("C:\Users\vdruo\Desktop\EPF\3A\PAML\GMAO_OptimizedMaintenanceSystem\BackEnd\query_response\Macro.xlsm")' Remplacez par le chemin de votre fichier Excel
objExcel.Run "RunMacro" ' Remplacez par le nom de votre macro
objExcel.Quit
Set objWorkbook = Nothing
Set objExcel = Nothing