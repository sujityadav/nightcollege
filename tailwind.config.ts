// import { fontFamily } from 'tailwindcss/defaultTheme';

/** @type {import('tailwindcss').Config} */
export const darkMode = ['class'];
export const content = [
  './src/**/*.{js,ts,jsx,tsx}',
 
];
export const safelist = ['dark'];
export const theme = {
  screens: {
    xs: '575px',
    // => @media (min-width: 575px) { ... }
    sm: '640px',
    // => @media (min-width: 640px) { ... }
    md: '768px',
    // => @media (min-width: 768px) { ... }
    lg: '1024px',
    // => @media (min-width: 1024px) { ... }
    xl: '1280px',
    // => @media (min-width: 1280px) { ... }
    '2xl': '1536px',
    // => @media (min-width: 1536px) { ... }
    '3xl': '1900px',
    // => @media (min-width: 1900px) { ... }
    // This is VW screen size.
  },
  extend: {
    colors: {
      interfacetextinverse: 'var(--interface-text-inverse)',
      BrandSupport1700: 'var(--Brand-Support-1-700)',
      BrandSupport1pure: 'var(--Brand-Support-1-pure)',
      InterfaceTextwhite: 'var(--Interface-Text-white)',
      BrandNeutral: 'var(--Brand-Neutral-900)',
      BrandSupport2300: 'var(--Brand-Support-2-300)',
      InterfaceTextlighter: 'var(--Interface-Text-lighter)',
      textgreencolor: 'var(--text-green-color)',
      InterfaceTextsubtitle: 'var(--Interface-Text-subtitle)',
      loginborder: 'var(--login-border)',
      BrandPrimarypure: 'var(--Brand-Primary-pure)',
      logincardborder: 'var(--login-card-border)',
      logincardbg: 'var(--login-card-bg)',
      logincardshadow: 'var(--login-card-shadow)',
      loginMicrosoftborder: 'var(--login-Microsoft-border)',
      InterfaceTexttitle: 'var(--Interface-Text-title)',
      InterfaceStrokedefault: 'var(--Interface-Stroke-default)',
      closecolor: 'var(--close-color)',
      InterfaceStrokesoft: 'var(--Interface-Stroke-soft)',
      interfacesurfacecomponent: 'var(--interface-surface-component)',
      InterfaceTextdefault: 'var(--Interface-Text-default)',
      InterfaceSurfacecomponentmuted: 'var(--Interface-Surface-component-muted)',
      ClearAll: 'var(--Clear-All)',
      interfacestrokedefaultnew: 'var(--interface-stroke-default-new)',
      yellowbg: 'var(--yellow-bg)',
      BrandNeutral50: 'var(--Brand-Neutral-50)',
      BrandNeutral100: 'var(--Brand-Neutral-100)',
      InterfaceStrokehard: 'var(--Interface-Stroke-hard)',
      BrandNeutral700: 'var(--Brand-Neutral-700)',
      BrandNeutralpure: 'var(--Brand-Neutral-pure)',
      BrandSupport1400: 'var(--Brand-Support-1-400)',
      BrandSupport1300: 'var(--Brand-Support-1-300)',
      BrandPrimary500: 'var(--Brand-Primary-500)',
      blackcolor: 'var(--black-color)',
      darkgreencolor: 'var(--dark-green-color)',
      BrandSupport150: 'var(--Brand-Support-1-50)',
      InterfaceSurfacepagemuted: 'var(--Interface-Surface-page-muted)',
      BrandNeutral500: 'var(--Brand-Neutral-500)',
      BrandPrimary300: 'var(--Brand-Primary-300)',
      BrandSupport250: 'var(--Brand-Support-2-50)',
      BrandPrimary50: 'var(--Brand-Primary-50)',
      Interfacefeedbackerror700: 'var(--Interface-feedback-error-700)',
      BrandNeutral950: 'var(--Brand-Neutral-950)',
      overlaybg: 'var(--overlay-bg)',

      background: 'var(--background)',
      foreground: 'hsl(var(--foreground))',
      card: {
        DEFAULT: 'hsl(var(--card))',
        foreground: 'hsl(var(--card-foreground))',
      },
      popover: {
        DEFAULT: 'hsl(var(--popover))',
        foreground: 'hsl(var(--popover-foreground))',
      },
      primary: {
        DEFAULT: 'var(--primary)',
        foreground: 'hsl(var(--primary-foreground))',
      },
      secondary: {
        DEFAULT: 'hsl(var(--secondary))',
        foreground: 'hsl(var(--secondary-foreground))',
      },

      accent: {
        DEFAULT: 'hsl(var(--accent))',
        foreground: 'hsl(var(--accent-foreground))',
      },
      destructive: {
        DEFAULT: 'hsl(var(--destructive))',
        foreground: 'hsl(var(--destructive-foreground))',
      },
      border: 'hsl(var(--border))',
      input: 'hsl(var(--input))',
      ring: 'hsl(var(--ring))',
      chart: {
        1: 'hsl(var(--chart-1))',
        2: 'hsl(var(--chart-2))',
        3: 'hsl(var(--chart-3))',
        4: 'hsl(var(--chart-4))',
        5: 'hsl(var(--chart-5))',
      },
    },
    keyframes: {
      'accordion-down': {
        from: { height: '0' },
        to: { height: 'var(--radix-accordion-content-height)' },
      },
      'accordion-up': {
        from: { height: 'var(--radix-accordion-content-height)' },
        to: { height: '0' },
      },
    },
    animation: {
      'accordion-down': 'accordion-down 0.2s ease-out',
      'accordion-up': 'accordion-up 0.2s ease-out',
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    },
  },
};
export const plugins = [require('tailwindcss-animate')];
