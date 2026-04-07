import { createSystem, defaultConfig, defineConfig, defineRecipe } from "@chakra-ui/react";

const buttonRecipe = defineRecipe({
  className: "chakra-button",
  base: {
    borderRadius: "full",
    fontWeight: "semibold",
    lineHeight: "1",
    borderWidth: "2px",
    borderColor: "transparent"
  },
  variants: {
    size: {
      sm: { h: "9", px: "4", textStyle: "sm" },
      md: { h: "10", px: "5", textStyle: "sm" },
      lg: { h: "12", px: "6", textStyle: "md" }
    },
    variant: {
      solid: {
        bg: "brand.500",
        color: "white",
        borderColor: "brand.500",
        _hover: { bg: "brand.600", borderColor: "brand.600" },
        _expanded: { bg: "brand.600", borderColor: "brand.600" }
      },
      light: {
        bg: "white",
        color: "brand.700",
        borderColor: "white",
        _hover: { bg: "gray.100", borderColor: "gray.100", color: "brand.700" },
        _expanded: { bg: "gray.100", borderColor: "gray.100", color: "brand.700" }
      },
      subtle: {
        bg: "brand.50",
        color: "brand.700",
        borderColor: "brand.200",
        _hover: { bg: "brand.100", borderColor: "brand.300" },
        _expanded: { bg: "brand.100", borderColor: "brand.300" }
      },
      outline: {
        bg: "transparent",
        color: "brand.700",
        borderColor: "brand.500",
        _hover: { bg: "brand.50", borderColor: "brand.600", color: "brand.700" },
        _expanded: { bg: "brand.50", borderColor: "brand.600", color: "brand.700" }
      },
      outlineLight: {
        bg: "transparent",
        color: "white",
        borderColor: "white",
        _hover: { bg: "white", color: "brand.700", borderColor: "white" },
        _expanded: { bg: "white", color: "brand.700", borderColor: "white" }
      },
      ghost: {
        color: "brand.700",
        _hover: { bg: "brand.50" },
        _expanded: { bg: "brand.100" }
      }
    }
  },
  defaultVariants: {
    size: "md",
    variant: "solid"
  }
});

const config = defineConfig({
  globalCss: {
    "[data-scope='button'][data-variant='solid']": {
      background: "#008f82",
      color: "#ffffff",
      borderColor: "#008f82"
    },
    "[data-scope='button'][data-variant='solid']:hover": {
      background: "#007b70",
      borderColor: "#007b70",
      color: "#ffffff"
    },
    "[data-scope='button'][data-variant='solid'] svg": {
      color: "currentColor"
    },
    "[data-scope='button'][data-variant='outline']": {
      background: "transparent",
      color: "#00695f",
      borderColor: "#008f82"
    },
    "[data-scope='button'][data-variant='outline'] svg": {
      color: "currentColor"
    },
    "[data-scope='button'][data-variant='outline']:hover": {
      background: "#e6f6f4",
      borderColor: "#007b70",
      color: "#00695f"
    },
    ".chakra-button[data-variant='outline']": {
      background: "transparent",
      color: "#00695f",
      borderColor: "#008f82"
    },
    ".chakra-button[data-variant='outline'] svg": {
      color: "inherit"
    },
    ".chakra-button[data-variant='outline']:hover": {
      background: "#e6f6f4",
      borderColor: "#007b70",
      color: "#00695f"
    }
  },
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f6f4" },
          100: { value: "#c3ebe6" },
          200: { value: "#99dcd4" },
          300: { value: "#67cbbf" },
          400: { value: "#2db5a5" },
          500: { value: "#008f82" },
          600: { value: "#007b70" },
          700: { value: "#00695f" },
          800: { value: "#0a544f" },
          900: { value: "#0b4642" }
        },
        accent: {
          500: { value: "#f26939" },
          600: { value: "#e55b29" }
        }
      },
      fonts: {
        body: { value: '"Inter", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif' },
        heading: { value: '"Inter", "Avenir Next", "Segoe UI", "Helvetica Neue", sans-serif' }
      }
    },
    recipes: {
      button: buttonRecipe
    }
  }
});

export const siteSystem = createSystem(defaultConfig, config);
