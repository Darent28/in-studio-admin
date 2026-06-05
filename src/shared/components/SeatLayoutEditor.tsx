import { Box, Typography, Button } from '@mui/material';
import { seatCode } from './SeatMap';

interface SeatLayoutEditorProps {
  rows: number;
  cols: number;
  /** Active seat codes — cells not in this list are aisles/gaps. */
  value: string[];
  onChange: (seats: string[]) => void;
}

export function SeatLayoutEditor({ rows, cols, value, onChange }: SeatLayoutEditorProps) {
  if (!rows || !cols) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
        Set rows and columns above to design the layout.
      </Typography>
    );
  }

  const toggle = (code: string) =>
    onChange(value.includes(code) ? value.filter((s) => s !== code) : [...value, code]);

  const fillAll = () => {
    const all: string[] = [];
    for (let r = 0; r < rows; r++)
      for (let c = 0; c < cols; c++)
        all.push(seatCode(r, c));
    onChange(all);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Button size="small" variant="outlined" onClick={fillAll} sx={{ fontSize: 11, py: 0.25, textTransform: 'none' }}>
          Fill all
        </Button>
        <Button size="small" variant="outlined" onClick={() => onChange([])} sx={{ fontSize: 11, py: 0.25, textTransform: 'none' }}>
          Clear all
        </Button>
        <Typography variant="caption" color="text.secondary" sx={{ ml: 'auto' }}>
          {value.length} seat{value.length !== 1 ? 's' : ''}
        </Typography>
      </Box>

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
        {/* FRONT indicator */}
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
              const isActive = value.includes(code);

              return (
                <Box
                  key={code}
                  onClick={() => toggle(code)}
                  title={isActive ? `${code} — click to make aisle` : `${code} — click to add seat`}
                  sx={{
                    width: 32,
                    height: 28,
                    borderRadius: '6px 6px 3px 3px',
                    border: isActive ? '1.5px solid #6C63FF' : '1.5px dashed #ccc',
                    bgcolor: isActive ? '#f0f4ff' : 'transparent',
                    color: isActive ? '#6C63FF' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 10,
                    fontWeight: 600,
                    cursor: 'pointer',
                    userSelect: 'none',
                    transition: 'all 0.12s',
                    '&:hover': {
                      transform: 'scale(1.08)',
                      borderColor: '#6C63FF',
                      borderStyle: 'solid',
                      color: '#6C63FF',
                      bgcolor: '#f0f4ff',
                    },
                  }}
                >
                  {isActive ? code : ''}
                </Box>
              );
            })}
          </Box>
        ))}
      </Box>

      <Box sx={{ display: 'flex', gap: 2, mt: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 12, borderRadius: '3px 3px 1px 1px', border: '1.5px solid #6C63FF', bgcolor: '#f0f4ff' }} />
          <Typography variant="caption" color="text.secondary">Seat</Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Box sx={{ width: 14, height: 12, borderRadius: '3px 3px 1px 1px', border: '1.5px dashed #ccc', bgcolor: 'transparent' }} />
          <Typography variant="caption" color="text.secondary">Gap / aisle</Typography>
        </Box>
      </Box>
    </Box>
  );
}
