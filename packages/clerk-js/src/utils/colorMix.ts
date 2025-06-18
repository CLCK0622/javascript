/**
 * A percentage string
 * @example '10%'
 */
type Percentage = `${number}%`;

/**
 * A default key for a shade of a color/lightness/etc
 * @example '25'
 */
// type DefaultShadeKey =
//   | '25'
//   | '50'
//   | '100'
//   | '150'
//   | '200'
//   | '300'
//   | '400'
//   | '500'
//   | '600'
//   | '700'
//   | '750'
//   | '800'
//   | '850'
//   | '900'
//   | '950';

/**
 * A key for a shade of an alpha color
 * @example '25'
 */
// type AlphaShadeKey = DefaultShadeKey;

/**
 * A key for a shade of a lightness color
 * @example '25'
 */
// type LightnessShadeKey = DefaultShadeKey;

/**
 * Mix a color with a color tint
 * @param color - The color to mix
 * @param percentage - The percentage to mix the color with
 * @param colorTint - The color to mix the color with
 * @returns The mixed color
 */
export function colorMix(colorOne: string, colorTwo: string) {
  return `color-mix(in oklch, ${colorOne}, ${colorTwo})`;
}

/**
 * Transparentize a color by a percentage
 * @param color - The color to transparentize
 * @param percentage - The percentage to transparentize the color by
 * @returns The transparentized color
 */
export function transparentize(color: string, percentage: Percentage) {
  return colorMix(`${color} ${percentage}`, 'transparent');
}

/**
 * Lighten a color by a percentage
 * @param color - The color to lighten
 * @param percentage - The percentage to lighten the color by
 * @returns The lightened color
 */
export function lighten(color: string, percentage: Percentage) {
  return colorMix(`${color} ${100 - parseInt(percentage)}%`, `white ${percentage}`);
}

/**
 * Darken a color by a percentage
 * @param color - The color to darken
 * @param percentage - The percentage to darken the color by
 * @returns The darkened color
 */
export function darken(color: string, percentage: Percentage) {
  return colorMix(`${color} ${100 - parseInt(percentage)}%`, `black 10%`);
}
