export const CUSTOM_COLOR_PRESETS = [
  { key: 'custom-1', hex: '#BB86FC', label: 'Violet' },
  { key: 'custom-2', hex: '#F783AC', label: 'Pink' },
  { key: 'custom-3', hex: '#4ECDC4', label: 'Teal' },
  { key: 'custom-4', hex: '#FF9F1C', label: 'Orange' },
  { key: 'custom-5', hex: '#FF6B6B', label: 'Red' },
  { key: 'custom-6', hex: '#22D3EE', label: 'Cyan' },
]

export function getCustomColorHex(colorKey) {
  return CUSTOM_COLOR_PRESETS.find((c) => c.key === colorKey)?.hex || CUSTOM_COLOR_PRESETS[0].hex
}
