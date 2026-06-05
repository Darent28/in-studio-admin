import { Box, Typography } from '@mui/material';

export type SeatState = 'available' | 'selected' | 'occupied';

interface SeatMapProps {
  rows: number;
  cols: number;
  /** When provided, cells NOT in this list render as empty gap space (aisle). */
  activeSeats?: string[];
  selected?: string[];
  occupied?: string[];
  onToggle?: (seat: string) => void;
  readonly?: boolean;
}

export function seatCode(rowIndex: number, colIndex: number): string {
  return `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`;
}

const SEAT_COLORS: Record<SeatState, { bg: string; border: string; color: string }> = {
  available: { bg: '#f0f4ff', border: '#6C63FF', color: '#6C63FF' },
  selected:  { bg: '#6C63FF', border: '#6C63FF', color: '#fff' },
  occupied:  { bg: '#e0e0e0', border: '#bdbdbd', color: '#9e9e9e' },
};

export function SeatMap({
  rows,
  cols,
  activeSeats,
  selected = [],
  occupied = [],
  onToggle,
  readonly = false,
}: SeatMapProps) {
  if (!rows || !cols) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        No layout configured for this room.
      </Typography>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          display: 'inline-flex',
          flexDirection: 'column',
          gap: 0.75,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        {/* FRONT bar */}
        <Box
          sx={{
            alignSelf: 'stretch',
            height: 6,
            borderRadius: 1,
            bgcolor: 'grey.300',
            mb: 1,
            position: 'relative',
            '&::after': {
              content: '"FRONT"',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: 9,
              color: 'text.disabled',
              letterSpacing: 1,
            },
          }}
        />

        {Array.from({ length: rows }, (_, rowIdx) => (
          <Box key={rowIdx} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <Typography
              variant="caption"
              sx={{ width: 16, textAlign: 'right', color: 'text.secondary', fontWeight: 600, flexShrink: 0 }}
            >
              {String.fromCharCode(65 + rowIdx)}
            </Typography>

            {Array.from({ length: cols }, (_, colIdx) => {
              const code = seatCode(rowIdx, colIdx);

              // Render gap when activeSeats is provided and this cell is not a seat
              if (activeSeats && !activeSeats.includes(code)) {
                return <Box key={code} sx={{ width: 32, height: 28, flexShrink: 0 }} />;
              }

              const isOccupied = occupied.includes(code);
              const isSelected = selected.includes(code);
              const state: SeatState = isOccupied ? 'occupied' : isSelected ? 'selected' : 'available';
              const colors = SEAT_COLORS[state];

              return (
                <Box
                  key={code}
                  onClick={() => { if (!readonly && !isOccupied && onToggle) onToggle(code); }}
                  title={code}
                  sx={{
                    width: 32,
                    height: 28,
                    borderRadius: '6px 6px 3px 3px',
                    border: `1.5px solid ${colors.border}`,
                    bgcolor: colors.bg,
                    color: colors.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: readonly || isOccupied ? 'default' : 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.15s',
                    '&:hover': !readonly && !isOccupied
                      ? { transform: 'scale(1.1)', boxShadow: '0 2px 8px rgba(108,99,255,0.3)' }
                      : {},
                  }}
                >
                  {code}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      {!readonly && (
        <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
          {(['available', 'selected', 'occupied'] as SeatState[]).map((s) => (
            <Box key={s} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box
                sx={{
                  width: 14,
                  height: 12,
                  borderRadius: '3px 3px 1px 1px',
                  border: `1.5px solid ${SEAT_COLORS[s].border}`,
                  bgcolor: SEAT_COLORS[s].bg,
                }}
              />
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'capitalize' }}>
                {s}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
