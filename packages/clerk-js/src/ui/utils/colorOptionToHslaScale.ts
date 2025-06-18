import type {
  ColorScale,
  ColorScaleWithRequiredBase,
  CssColorOrAlphaScale,
  CssColorOrScale,
  HslaColor,
  HslaColorString,
} from '@clerk/types';

import { darken, lighten, transparentize } from '@/utils/colorMix';

import { colors } from './colors';
import { fromEntries } from './fromEntries';

/**
 * A percentage string
 * @example '10%'
 */
type Percentage = `${number}%`;

const LIGHT_SHADES = ['25', '50', '100', '150', '200', '300', '400'].reverse();
const DARK_SHADES = ['600', '700', '750', '800', '850', '900', '950'];

const ALL_SHADES = [...[...LIGHT_SHADES].reverse(), '500', ...DARK_SHADES] as const;

const TARGET_L_50_SHADE = 97;
const TARGET_L_900_SHADE = 12;

/**
 * A default key for a shade of a color/lightness/etc
 * @example '25'
 */
type DefaultShadeKey =
  | '25'
  | '50'
  | '100'
  | '150'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '750'
  | '800'
  | '850'
  | '900'
  | '950';

/**
 * A key for a shade of an alpha color
 * @example '25'
 */
type AlphaShadeKey = DefaultShadeKey;

/**
 * A key for a shade of a lightness color
 * @example '25'
 */
type LightnessShadeKey = DefaultShadeKey;

/**
 * A map of alpha shades to percentages
 */
const ALPHA_SHADES_MAP: ColorScale<Percentage> = {
  '25': '2%',
  '50': '3%',
  '100': '7%',
  '150': '11%',
  '200': '15%',
  '300': '28%',
  '400': '41%',
  '500': '53%',
  '600': '62%',
  '700': '73%',
  '750': '78%',
  '800': '81%',
  '850': '84%',
  '900': '87%',
  '950': '92%',
} as const;

function createEmptyColorScale<T = undefined>(): ColorScale<T | undefined> {
  return {
    '25': undefined,
    '50': undefined,
    '100': undefined,
    '150': undefined,
    '200': undefined,
    '300': undefined,
    '400': undefined,
    '500': undefined,
    '600': undefined,
    '700': undefined,
    '750': undefined,
    '800': undefined,
    '850': undefined,
    '900': undefined,
    '950': undefined,
  };
}

type WithPrefix<T extends Record<string, string>, Prefix extends string> = {
  [k in keyof T as `${Prefix}${k & string}`]: T[k];
};

declare global {
  interface Window {
    ClerkCSSSupport: {
      colorMix?: boolean;
    };
  }
}

export const isColorMixSupported = () => {
  if (!window.ClerkCSSSupport) {
    window.ClerkCSSSupport = {};
  }

  if (window.ClerkCSSSupport.colorMix === undefined) {
    window.ClerkCSSSupport.colorMix = CSS.supports('color', 'color-mix(in srgb, red, blue)');
  }

  return window.ClerkCSSSupport.colorMix;
};

export function colorOptionToAlphaScale<Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined;
export function colorOptionToAlphaScale<Prefix extends string>(
  colorOption: string,
  prefix: Prefix,
): WithPrefix<ColorScale<AlphaShadeKey>, Prefix> | undefined;
export function colorOptionToAlphaScale<Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | WithPrefix<ColorScale<AlphaShadeKey>, Prefix> | undefined {
  if (!colorOption) {
    return undefined;
  } else if (isColorMixSupported()) {
    return createAlphaScaleWithTransparentize(colorOption as string, prefix); // TODO: Don't cast to string
  } else {
    return colorOptionToHslaAlphaScale(colorOption, prefix);
  }
}

/**
 * Create an alpha scale with transparentize
 * @param baseColor - The base color
 * @param prefix - The prefix for the scale
 * @returns The alpha scale
 */
export function createAlphaScaleWithTransparentize<Prefix extends string>(
  baseColor: string,
  prefix: Prefix,
): WithPrefix<ColorScale<AlphaShadeKey>, Prefix> {
  return Object.fromEntries(
    Object.entries(ALPHA_SHADES_MAP).map(([shadeKey, percentage]) => [
      `${prefix}${shadeKey}`,
      transparentize(baseColor, percentage),
    ]),
  ) as WithPrefix<ColorScale<AlphaShadeKey>, Prefix>;
}

export const colorOptionToHslaAlphaScale = <Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined => {
  return getUserProvidedScaleOrGenerateHslaColorsScale(colorOption, prefix, generateFilledAlphaScaleFromBaseHslaColor);
};

// =======================================================================================

export function colorOptionToLightnessScale<Prefix extends string>(
  colorOption: ColorScaleWithRequiredBase<string> | CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined;
export function colorOptionToLightnessScale<Prefix extends string>(
  colorOption: string | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<AlphaShadeKey>, Prefix> | undefined;
export function colorOptionToLightnessScale<Prefix extends string>(
  colorOption: ColorScaleWithRequiredBase<string> | CssColorOrAlphaScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | WithPrefix<ColorScale<AlphaShadeKey>, Prefix> | undefined {
  if (!colorOption) {
    return undefined;
  } else if (isColorMixSupported()) {
    return createColorMixLightnessScale(colorOption as string, prefix);
  } else {
    return colorOptionToHslaLightnessScale(colorOption, prefix);
  }
}

const LIGHTNESS_SHADES_DEF: Record<LightnessShadeKey, { type: 'lighten' | 'darken' | 'base'; amount: Percentage }> = {
  '25': { type: 'lighten', amount: '92%' },
  '50': { type: 'lighten', amount: '85%' },
  '100': { type: 'lighten', amount: '70%' },
  '150': { type: 'lighten', amount: '55%' },
  '200': { type: 'lighten', amount: '40%' },
  '300': { type: 'lighten', amount: '25%' },
  '400': { type: 'lighten', amount: '10%' },
  '500': { type: 'base', amount: '0%' },
  '600': { type: 'darken', amount: '10%' },
  '700': { type: 'darken', amount: '25%' },
  '750': { type: 'darken', amount: '40%' },
  '800': { type: 'darken', amount: '55%' },
  '850': { type: 'darken', amount: '70%' },
  '900': { type: 'darken', amount: '85%' },
  '950': { type: 'darken', amount: '92%' },
};

const ALL_LIGHTNESS_SHADE_KEYS = Object.keys(LIGHTNESS_SHADES_DEF) as LightnessShadeKey[];

/**
 * Creates a full lightness color scale (shades 25-950) using color-mix lighten/darken.
 * @param colorOption The base color string (used as 500 shade) or a partial scale object.
 * @param prefix The prefix for the scale keys (e.g., 'primary').
 * @returns A prefixed color scale object, or undefined if colorOption is undefined.
 */
export function createColorMixLightnessScale<Prefix extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>>,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined;
export function createColorMixLightnessScale<Prefix extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>> | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined;
export function createColorMixLightnessScale<Prefix extends string>(
  colorOption: string | Partial<Record<LightnessShadeKey, string>> | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined {
  if (!colorOption) {
    return undefined;
  }

  let baseFor500: string;
  const userProvidedShades: Partial<Record<LightnessShadeKey, string>> = {};

  if (typeof colorOption === 'string') {
    baseFor500 = colorOption;
  } else {
    if (!colorOption['500']) {
      throw new Error(
        `Color scale generation for prefix '${prefix}' failed: The '500' shade is required in the colorOption object.`,
      );
    }
    baseFor500 = colorOption['500'];
    for (const key of ALL_LIGHTNESS_SHADE_KEYS) {
      if (colorOption[key]) {
        userProvidedShades[key] = colorOption[key];
      }
    }
  }

  const generatedScale: Partial<Record<LightnessShadeKey, string>> = {};
  for (const shadeKey of ALL_LIGHTNESS_SHADE_KEYS) {
    const definition = LIGHTNESS_SHADES_DEF[shadeKey];
    switch (definition.type) {
      case 'base':
        generatedScale[shadeKey] = baseFor500;
        break;
      case 'lighten':
        console.log('lighten', baseFor500, shadeKey, definition.amount);
        generatedScale[shadeKey] = lighten(baseFor500, definition.amount);
        break;
      case 'darken':
        generatedScale[shadeKey] = darken(baseFor500, definition.amount);
        break;
    }
  }

  const mergedScale = { ...generatedScale, ...userProvidedShades };

  const resultScale = {} as Record<`${Prefix}${LightnessShadeKey}`, string>;
  for (const key of ALL_LIGHTNESS_SHADE_KEYS) {
    if (mergedScale[key]) {
      resultScale[`${prefix}${key}`] = mergedScale[key];
    }
  }
  return resultScale as unknown as WithPrefix<ColorScale<HslaColorString>, Prefix>;
}

export const colorOptionToHslaLightnessScale = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined => {
  return fillUserProvidedScaleWithGeneratedHslaColors(colorOption, prefix, generateFilledScaleFromBaseHslaColor);
};

const getUserProvidedScaleOrGenerateHslaColorsScale = <Prefix extends string>(
  colorOption: CssColorOrAlphaScale | undefined,
  prefix: Prefix,
  generator: (base: HslaColor) => ColorScale<HslaColor>,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'object' && !ALL_SHADES.every(key => key in colorOption)) {
    throw new Error('You need to provide all the following shades: ' + ALL_SHADES.join(', '));
  }

  if (typeof colorOption === 'object') {
    const scale = Object.keys(colorOption).reduce((acc, key) => {
      // @ts-expect-error - TODO: Fix this
      acc[key] = colors.toHslaColor(colorOption[key]);
      return acc;
    }, createEmptyColorScale());
    return prefixAndStringifyHslaScale(scale, prefix);
  }

  const hslaColor = colors.toHslaColor(colorOption);
  const filledHslaColorScale = generator(hslaColor);
  return prefixAndStringifyHslaScale(filledHslaColorScale, prefix);
};

const fillUserProvidedScaleWithGeneratedHslaColors = <Prefix extends string>(
  colorOption: CssColorOrScale | undefined,
  prefix: Prefix,
  generator: (base: HslaColor) => ColorScale<HslaColor>,
): WithPrefix<ColorScale<HslaColorString>, Prefix> | undefined => {
  if (!colorOption) {
    return undefined;
  }

  if (typeof colorOption === 'object' && !colorOption['500']) {
    throw new Error('You need to provide at least the 500 shade');
  }

  const userDefinedHslaColorScale = userDefinedColorToHslaColorScale(colorOption);
  const filledHslaColorScale = generator(userDefinedHslaColorScale['500']);
  const merged = mergeFilledIntoUserDefinedScale(filledHslaColorScale, userDefinedHslaColorScale);
  return prefixAndStringifyHslaScale(merged, prefix);
};

const mergeFilledIntoUserDefinedScale = (
  generated: ColorScale<HslaColor>,
  userDefined: ColorScale<HslaColor>,
): ColorScale<HslaColor> => {
  // @ts-expect-error - TODO: Fix this
  return fromEntries(Object.entries(userDefined).map(([k, v]) => [k, v || generated[k]]));
};

const prefixAndStringifyHslaScale = <Prefix extends string>(
  scale: ColorScale<HslaColor | undefined>,
  prefix: Prefix,
) => {
  const res = {} as WithPrefix<ColorScale<HslaColorString>, Prefix>;
  for (const key in scale) {
    // @ts-expect-error - TODO: Fix this
    if (scale[key]) {
      // @ts-expect-error - TODO: Fix this
      res[prefix + key] = colors.toHslaString(scale[key]);
    }
  }
  return res;
};

const userDefinedColorToHslaColorScale = (colorOption: CssColorOrScale): ColorScale<HslaColor> => {
  const baseScale = typeof colorOption === 'string' ? { '500': colorOption } : colorOption;
  const hslaScale = createEmptyColorScale();
  // @ts-expect-error - TODO: Fix this
  const entries = Object.keys(hslaScale).map(k => [k, baseScale[k] ? colors.toHslaColor(baseScale[k]) : undefined]);
  return fromEntries(entries) as ColorScale<HslaColor>;
};

/**
 * This function generates a color scale using `base` as the 500 shade.
 * The lightest shade (50) will always have a lightness of TARGET_L_50_SHADE,
 * and the darkest shade (900) will always have a lightness of TARGET_L_900_SHADE.
 * It calculates the required inc/decr lightness steps and applies them to base
 */
const generateFilledScaleFromBaseHslaColor = (base: HslaColor): ColorScale<HslaColor> => {
  const newScale = createEmptyColorScale<HslaColor>();
  type Key = keyof typeof newScale;
  newScale['500'] = base;

  const lightPercentage = (TARGET_L_50_SHADE - base.l) / LIGHT_SHADES.length;
  const darkPercentage = (base.l - TARGET_L_900_SHADE) / DARK_SHADES.length;

  LIGHT_SHADES.forEach(
    (shade, i) => (newScale[shade as any as Key] = colors.changeHslaLightness(base, (i + 1) * lightPercentage)),
  );
  DARK_SHADES.map(
    (shade, i) => (newScale[shade as any as Key] = colors.changeHslaLightness(base, (i + 1) * darkPercentage * -1)),
  );
  return newScale as ColorScale<HslaColor>;
};

const generateFilledAlphaScaleFromBaseHslaColor = (base: HslaColor): ColorScale<HslaColor> => {
  const newScale = createEmptyColorScale<HslaColor>();
  const baseWithoutAlpha = colors.setHslaAlpha(base, 0);
  const alphas = [0.02, 0.03, 0.07, 0.11, 0.15, 0.28, 0.41, 0.53, 0.62, 0.73, 0.78, 0.81, 0.84, 0.87, 0.92];
  // @ts-expect-error - TODO: Fix this
  Object.keys(newScale).forEach((k, i) => (newScale[k] = colors.setHslaAlpha(baseWithoutAlpha, alphas[i])));
  return newScale as ColorScale<HslaColor>;
};
