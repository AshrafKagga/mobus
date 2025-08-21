import { useEffect, useRef } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  className?: string;
}

export function QRCode({ value, size = 128, className = "" }: QRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Simple QR code placeholder implementation
    // In a real application, you would use a proper QR code library
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    // Clear canvas
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, size, size);

    // Create a simple pattern to represent QR code
    const moduleSize = size / 25; // 25x25 grid
    ctx.fillStyle = "#000000";

    // Draw border
    ctx.fillRect(0, 0, size, moduleSize);
    ctx.fillRect(0, 0, moduleSize, size);
    ctx.fillRect(size - moduleSize, 0, moduleSize, size);
    ctx.fillRect(0, size - moduleSize, size, moduleSize);

    // Draw corner squares (finder patterns)
    const cornerSize = moduleSize * 7;
    
    // Top-left corner
    ctx.fillRect(0, 0, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(2 * moduleSize, 2 * moduleSize, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);

    // Top-right corner
    ctx.fillStyle = "#000000";
    ctx.fillRect(size - cornerSize, 0, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(size - cornerSize + moduleSize, moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(size - cornerSize + 2 * moduleSize, 2 * moduleSize, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);

    // Bottom-left corner
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, size - cornerSize, cornerSize, cornerSize);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(moduleSize, size - cornerSize + moduleSize, cornerSize - 2 * moduleSize, cornerSize - 2 * moduleSize);
    ctx.fillStyle = "#000000";
    ctx.fillRect(2 * moduleSize, size - cornerSize + 2 * moduleSize, cornerSize - 4 * moduleSize, cornerSize - 4 * moduleSize);

    // Add some random modules to simulate data
    ctx.fillStyle = "#000000";
    for (let i = 8; i < 17; i++) {
      for (let j = 8; j < 17; j++) {
        if (Math.random() > 0.5) {
          ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
        }
      }
    }

  }, [value, size]);

  return (
    <canvas
      ref={canvasRef}
      className={`border border-gray-300 ${className}`}
      data-testid="qr-code"
    />
  );
}
