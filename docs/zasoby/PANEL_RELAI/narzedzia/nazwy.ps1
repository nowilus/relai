param([string]$Like = '*', [int]$Max = 60)
# Lists named controls of the Claude window whose name matches -Like (to find a button to press).
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes
$AE = [System.Windows.Automation.AutomationElement]
$proc = Get-Process claude | Where-Object { $_.MainWindowTitle -eq 'Claude' } | Select-Object -First 1
$root = $AE::FromHandle($proc.MainWindowHandle)
$all = $root.FindAll([System.Windows.Automation.TreeScope]::Descendants, [System.Windows.Automation.Condition]::TrueCondition)
$n = 0
foreach ($e in $all) {
  $name = $e.Current.Name
  if ($name -and $name -like $Like) {
    $r = $e.Current.BoundingRectangle
    "$($e.Current.ControlType.ProgrammaticName) '$name' $([int]$r.X),$([int]$r.Y)"
    $n++; if ($n -ge $Max) { break }
  }
}
