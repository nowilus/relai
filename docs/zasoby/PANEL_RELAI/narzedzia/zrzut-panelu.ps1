param(
  [string]$Tab = '',          # a tab button to press first ('Koszty', 'Mapa'…); empty: as it is
  [string]$Press = '',        # another button to press after the tab ('▸ Rozwiń'…), first match
  [string]$Out = 'zrzut.png', # where the picture goes
  [int]$Scroll = 0,           # wheel notches down inside the pane before the shot (negative: up)
  [switch]$Chain,             # print the ancestors of the pane title instead of a shot
  [string]$Anchor = 'Panel RelAI', # a name inside the pane to find it by (a probe: its title line)
  [string]$PaneTab = 'RelAI',     # the pane's own tab in the app's pane bar, selected first
  [switch]$UnfoldAll              # press every Rozwiń / Szczegóły in the pane, a few rounds
)
# Shoots the RelAI pane of the Claude desktop window by itself (WYGLAD_PANELU E3): UI Automation
# finds the pane and presses its buttons, PrintWindow draws the window even when it is covered.
Add-Type -AssemblyName UIAutomationClient, UIAutomationTypes, System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class W {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [DllImport("user32.dll")] public static extern bool SetCursorPos(int x, int y);
  [DllImport("user32.dll")] public static extern void mouse_event(uint f, uint x, uint y, int d, UIntPtr e);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
'@
$AE = [System.Windows.Automation.AutomationElement]
$proc = Get-Process claude | Where-Object { $_.MainWindowTitle -eq 'Claude' } | Select-Object -First 1
$hwnd = $proc.MainWindowHandle
$root = $AE::FromHandle($hwnd)
function Find([string]$name) {
  $c = New-Object System.Windows.Automation.PropertyCondition($AE::NameProperty, $name)
  for ($i = 0; $i -lt 5; $i++) { $h = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $c); if ($h) { return $h }; Start-Sleep -Milliseconds 600 }
  return $null
}
function Press([string]$name) {
  $b = Find $name
  if (-not $b) { throw "nie ma przycisku '$name'" }
  $b.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke()
  Start-Sleep -Milliseconds 1500
}
if ($PaneTab) {
  $pc = New-Object System.Windows.Automation.AndCondition((New-Object System.Windows.Automation.PropertyCondition($AE::NameProperty, $PaneTab)), (New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::TabItem)))
  $pt = $root.FindFirst([System.Windows.Automation.TreeScope]::Descendants, $pc)
  if ($pt) { $pt.GetCurrentPattern([System.Windows.Automation.SelectionItemPattern]::Pattern).Select(); Start-Sleep -Milliseconds 1500 }
}
$title = Find $Anchor
if (-not $title) { throw "nie ma w oknie elementu '$Anchor'" }
# The pane: the nearest ancestor of the title as wide as the pane's own box (title + some)
$walker = [System.Windows.Automation.TreeWalker]::ControlViewWalker
$node = $title; $pane = $null
while ($node) {
  $r = $node.Current.BoundingRectangle
  if ($Chain) { "$($node.Current.ControlType.ProgrammaticName) '$($node.Current.Name)' $([int]$r.X),$([int]$r.Y) $([int]$r.Width)x$([int]$r.Height)" }
  if (-not $pane -and $node.Current.Name -eq 'Plugin') { $pane = $node } # the app's box of a plugin pane
  $node = $walker.GetParent($node)
}
if ($Chain) { return }
if ($Tab) { Press $Tab }
if ($Press) { Press $Press }
if ($UnfoldAll) {
  # Each press redraws; the sheet's hidden copy holds the same buttons at the same place, so one
  # press per place and round (a second one on the copy would fold it back)
  for ($round = 0; $round -lt 15; $round++) {
    # The top copy comes after the hidden one in the tree: the last button at a place is the live one
    $byPlace = [ordered]@{}; $n = 0
    $bc = New-Object System.Windows.Automation.PropertyCondition($AE::ControlTypeProperty, [System.Windows.Automation.ControlType]::Button)
    # Only inside the pane, and only the pane's own fold labels: a match in the whole window pressed a
    # chat button named after a screenshot ("…rozwiniete.png") and opened its preview (2026-10-15)
    $scope = if ($pane) { $pane } else { $root }
    foreach ($b in $scope.FindAll([System.Windows.Automation.TreeScope]::Descendants, $bc)) {
      if ($b.Current.Name -notmatch '^(▸ Rozwiń|Rozwiń|Szczegóły)$') { continue }
      $r = $b.Current.BoundingRectangle
      $byPlace["$([int]$r.X),$([int]$r.Y)"] = $b
    }
    foreach ($at in $byPlace.Keys) {
      try { $byPlace[$at].GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke(); $n++; Start-Sleep -Milliseconds 1200 } catch { }
      break
    }
    if ($n -eq 0) { break }
  }
}
$wr = New-Object W+RECT; [void][W]::GetWindowRect($hwnd, [ref]$wr)
$pr = if ($pane) { $pane.Current.BoundingRectangle } else { $title.Current.BoundingRectangle }
if ($Scroll -ne 0) {
  [void][W]::SetCursorPos([int]($pr.X + $pr.Width / 2), [int]($pr.Y + $pr.Height / 2))
  [W]::mouse_event(0x0800, 0, 0, -120 * $Scroll, [UIntPtr]::Zero); Start-Sleep -Milliseconds 800
}
$bmp = New-Object System.Drawing.Bitmap ($wr.R - $wr.L), ($wr.B - $wr.T)
$g = [System.Drawing.Graphics]::FromImage($bmp); $dc = $g.GetHdc()
[void][W]::PrintWindow($hwnd, $dc, 2); $g.ReleaseHdc($dc); $g.Dispose()
$crop = New-Object System.Drawing.Rectangle ([int]$pr.X - $wr.L), ([int]$pr.Y - $wr.T), ([int]$pr.Width), ([int]$pr.Height)
$crop = [System.Drawing.Rectangle]::Intersect($crop, (New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height))
$bmp.Clone($crop, $bmp.PixelFormat).Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
"zapisano $Out ($($crop.Width)x$($crop.Height))"
