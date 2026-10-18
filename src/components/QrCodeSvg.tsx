import React from 'react';

interface QrCodeSvgProps {
  value: string;
  size?: number;
  className?: string;
  subText?: string;
}

// Deterministic pseudo-random 2D matrix generator for QR representation with authentic finder patterns
function generateQrMatrix(input: string, matrixSize = 25): boolean[][] {
  const matrix: boolean[][] = Array.from({ length: matrixSize }, () =>
    Array(matrixSize).fill(false)
  );

  // Helper to draw standard 7x7 QR finder patterns
  const drawFinderPattern = (startX: number, startY: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const isBorder = r === 0 || r === 6 || c === 0 || c === 6;
        const isCenter = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        matrix[startY + r][startX + c] = isBorder || isCenter;
      }
    }
  };

  // 3 standard corners
  drawFinderPattern(0, 0); // Top-left
  drawFinderPattern(matrixSize - 7, 0); // Top-right
  drawFinderPattern(0, matrixSize - 7); // Bottom-left

  // Timing patterns
  for (let i = 8; i < matrixSize - 8; i++) {
    matrix[6][i] = i % 2 === 0;
    matrix[i][6] = i % 2 === 0;
  }

  // Hash input string to fill data cells
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }

  let seed = Math.abs(hash) || 123456789;
  const lcg = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      // Skip finder patterns and timing lines
      const inTopLeft = r < 8 && c < 8;
      const inTopRight = r < 8 && c >= matrixSize - 8;
      const inBottomLeft = r >= matrixSize - 8 && c < 8;
      const inTiming = (r === 6 && c >= 8 && c < matrixSize - 8) || (c === 6 && r >= 8 && r < matrixSize - 8);

      if (inTopLeft || inTopRight || inBottomLeft || inTiming) continue;

      // Deterministic fill
      matrix[r][c] = lcg() > 0.52;
    }
  }

  return matrix;
}

export const QrCodeSvg: React.FC<QrCodeSvgProps> = ({
  value,
  size = 90,
  className = '',
  subText = 'SCAN FOR SDS',
}) => {
  const matrix = React.useMemo(() => generateQrMatrix(value, 25), [value]);
  const cellSize = 100 / matrix.length;

  return (
    <div className={`inline-flex flex-col items-center bg-white p-1 rounded-xs ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="w-full h-full"
        shapeRendering="crispEdges"
      >
        <rect width="100" height="100" fill="#FFFFFF" />
        {matrix.map((row, rIdx) =>
          row.map((cell, cIdx) =>
            cell ? (
              <rect
                key={`${rIdx}-${cIdx}`}
                x={cIdx * cellSize}
                y={rIdx * cellSize}
                width={cellSize}
                height={cellSize}
                fill="#0F172A"
              />
            ) : null
          )
        )}
      </svg>
      {subText && (
        <span className="text-[8px] font-bold text-neutral-800 tracking-wider text-center uppercase mt-0.5">
          {subText}
        </span>
      )}
    </div>
  );
};
