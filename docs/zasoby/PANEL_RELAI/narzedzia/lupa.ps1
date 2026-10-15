param([string]$In, [string]$Out, [int]$X, [int]$Y, [int]$W = 60, [int]$H = 40, [int]$Zoom = 10)
# Cuts a small region of a screenshot and enlarges it pixel by pixel (no smoothing) to check a seam.
Add-Type -AssemblyName System.Drawing
$src = [System.Drawing.Bitmap]::FromFile($In)
$dst = New-Object System.Drawing.Bitmap ($W * $Zoom), ($H * $Zoom)
$g = [System.Drawing.Graphics]::FromImage($dst)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::Half
$g.DrawImage($src, (New-Object System.Drawing.Rectangle 0, 0, ($W * $Zoom), ($H * $Zoom)), (New-Object System.Drawing.Rectangle $X, $Y, $W, $H), [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose(); $dst.Save($Out, [System.Drawing.Imaging.ImageFormat]::Png); $src.Dispose()
"lupa $Out"
