param([string]$Out = 'okno.png', [int]$FromX = 0)
# The whole Claude window (or its right part from -FromX px), when the pane itself cannot be found.
Add-Type -AssemblyName System.Drawing
Add-Type @'
using System; using System.Runtime.InteropServices;
public static class W2 {
  [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr h, IntPtr dc, uint f);
  [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr h, out RECT r);
  [StructLayout(LayoutKind.Sequential)] public struct RECT { public int L, T, R, B; }
}
'@
$proc = Get-Process claude | Where-Object { $_.MainWindowTitle -eq 'Claude' } | Select-Object -First 1
$h = $proc.MainWindowHandle
$wr = New-Object W2+RECT; [void][W2]::GetWindowRect($h, [ref]$wr)
$bmp = New-Object System.Drawing.Bitmap ($wr.R - $wr.L), ($wr.B - $wr.T)
$g = [System.Drawing.Graphics]::FromImage($bmp); $dc = $g.GetHdc()
[void][W2]::PrintWindow($h, $dc, 2); $g.ReleaseHdc($dc); $g.Dispose()
$crop = New-Object System.Drawing.Rectangle $FromX, 0, ($bmp.Width - $FromX), $bmp.Height
$bmp.Clone($crop, $bmp.PixelFormat).Save($Out, [System.Drawing.Imaging.ImageFormat]::Png)
"zapisano $Out"
