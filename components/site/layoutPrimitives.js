import Link from "next/link";

const space = (value) => {
  if (value == null) return undefined;
  if (typeof value === "number") return `${value * 4}px`;
  if (value === "full") return "100%";
  return value;
};

const pick = (value) => {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value.base ?? value.sm ?? value.md ?? value.lg;
  }
  return value;
};

const colorMap = {
  "blackAlpha.600": "rgba(0,0,0,.6)",
  "blackAlpha.800": "rgba(0,0,0,.8)",
  "gray.50": "#f8fafc",
  "gray.100": "#f1f5f9",
  "gray.200": "#e2e8f0",
  "gray.400": "#94a3b8",
  "gray.500": "#64748b",
  "gray.600": "#475569",
  "gray.700": "#334155",
  "gray.800": "#1e293b",
  "gray.900": "#0f172a",
  "orange.500": "#f26939",
  "purple.700": "#6d28d9",
  "teal.50": "#e6f6f4",
  "teal.100": "#bfe7e2",
  "teal.200": "#99d8cf",
  "teal.400": "#4db9a8",
  "teal.500": "#008f82",
  "teal.600": "#007b70",
  "teal.700": "#00695f",
  white: "#ffffff",
};

const fontSizes = {
  xs: "0.75rem",
  sm: "0.875rem",
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
};

const headingSizes = {
  md: "1rem",
  lg: "1.125rem",
  xl: "1.25rem",
  "2xl": "1.5rem",
  "3xl": "1.875rem",
  "4xl": "2.25rem",
  "5xl": "3rem",
};

const radii = {
  md: "6px",
  lg: "8px",
  xl: "12px",
  full: "9999px",
};

function mapped(value) {
  const next = pick(value);
  return colorMap[next] || next;
}

function dimension(value) {
  const next = pick(value);
  return space(next);
}

function displayClass(display) {
  if (!display || typeof display !== "object" || Array.isArray(display)) return "";
  if (display.base === "none" && display.md === "block") return "lp-hidden-md-block";
  if (display.base === "none" && display.md === "flex") return "lp-hidden-md-flex";
  if (display.base === "none" && display.md === "grid") return "lp-hidden-md-grid";
  if (display.base === "block" && display.md === "none") return "lp-block-md-hidden";
  if (display.base === "flex" && display.md === "none") return "lp-flex-md-hidden";
  return "";
}

function joinClassName(...values) {
  return values.filter(Boolean).join(" ") || undefined;
}

const BREAKPOINTS = ["base", "sm", "md", "lg", "xl"];

// Chakra-style responsive props: { base, sm, md, lg, xl }. Resolved with carry-forward,
// emitted as CSS custom properties; globals.css applies them at Chakra's breakpoints.
const RESPONSIVE_PROPS = {
  fontSize: { name: "fs", css: ["fontSize"], map: (v) => fontSizes[v] || v },
  mt: { name: "mt", css: ["marginTop"], map: space },
  mb: { name: "mb", css: ["marginBottom"], map: space },
  ml: { name: "ml", css: ["marginLeft"], map: space },
  mr: { name: "mr", css: ["marginRight"], map: space },
  py: { name: "py", css: ["paddingTop", "paddingBottom"], map: space },
  px: { name: "px", css: ["paddingLeft", "paddingRight"], map: space },
  pt: { name: "pt", css: ["paddingTop"], map: space },
  pb: { name: "pb", css: ["paddingBottom"], map: space },
  p: { name: "p", css: ["padding"], map: space },
  gap: { name: "gap", css: ["gap"], map: space },
  spacing: { name: "gap", css: ["gap"], map: space },
  maxW: { name: "maxw", css: ["maxWidth"], map: space },
  w: { name: "w", css: ["width"], map: space },
  h: { name: "h", css: ["height"], map: space },
};

function resolveResponsive(value, map) {
  let last;
  return BREAKPOINTS.map((bp) => {
    if (value[bp] != null) last = value[bp];
    return last == null ? undefined : map(last);
  });
}

function applyResponsive(style, props, extra = {}) {
  const all = { ...RESPONSIVE_PROPS, ...extra };
  Object.entries(all).forEach(([key, def]) => {
    const value = props[key];
    if (!value || typeof value !== "object" || Array.isArray(value)) return;
    def.css.forEach((cssKey) => delete style[cssKey]);
    resolveResponsive(value, def.map).forEach((resolved, i) => {
      if (resolved != null) style[`--lp-${def.name}-${i}`] = resolved;
    });
  });
}

function commonStyle(props) {
  const style = { ...(props.style || {}) };
  const direct = {
    alignItems: props.alignItems ?? props.align,
    background: mapped(props.bg),
    borderColor: mapped(props.borderColor),
    borderRadius: radii[props.borderRadius] || props.borderRadius,
    bottom: props.bottom,
    color: mapped(props.color),
    cursor: props.cursor,
    display: typeof props.display === "object" ? undefined : props.display,
    flex: props.flex,
    flexShrink: props.flexShrink,
    flexWrap: props.flexWrap,
    fontWeight: props.fontWeight,
    gap: space(pick(props.gap ?? props.spacing)),
    height: dimension(props.h),
    inset: props.inset,
    justifyContent: props.justifyContent ?? props.justify,
    left: props.left,
    letterSpacing: props.letterSpacing === "wide" ? "0.07em" : props.letterSpacing,
    lineHeight: props.lineHeight,
    marginBottom: space(pick(props.mb)),
    marginLeft: space(pick(props.ml)),
    marginRight: space(pick(props.mr)),
    marginTop: space(pick(props.mt)),
    maxHeight: dimension(props.maxH),
    maxWidth: dimension(props.maxW),
    minWidth: dimension(props.minW),
    overflow: props.overflow,
    overflowX: props.overflowX,
    padding: space(pick(props.p)),
    paddingBottom: space(pick(props.pb)),
    paddingLeft: space(pick(props.pl ?? props.px)),
    paddingRight: space(pick(props.pr ?? props.px)),
    paddingTop: space(pick(props.pt)),
    position: props.position,
    right: props.right,
    scrollMarginTop: props.scrollMarginTop,
    textAlign: props.textAlign,
    textDecoration: props.textDecoration,
    textTransform: props.textTransform,
    top: props.top,
    transition: props.transition,
    width: dimension(props.w),
    zIndex: props.zIndex,
  };
  if (props.py != null) {
    direct.paddingTop = space(pick(props.py));
    direct.paddingBottom = space(pick(props.py));
  }
  if (props.mx === "auto") {
    direct.marginLeft = "auto";
    direct.marginRight = "auto";
  }
  if (props.my != null) {
    direct.marginTop = space(pick(props.my));
    direct.marginBottom = space(pick(props.my));
  }
  if (props.borderWidth) direct.borderWidth = props.borderWidth;
  if (props.border) direct.border = props.border;
  if (props.borderBottom) direct.borderBottom = props.borderBottom;
  if (props.borderTop) direct.borderTop = props.borderTop;
  if (props.gridColumn) direct.gridColumn = props.gridColumn;
  if (props.fontSize) direct.fontSize = fontSizes[pick(props.fontSize)] || pick(props.fontSize);
  Object.entries(direct).forEach(([key, value]) => {
    if (value != null) style[key] = value;
  });
  applyResponsive(style, props);
  return style;
}

function clean(props) {
  const {
    align,
    alignItems,
    bg,
    border,
    borderBottom,
    borderColor,
    borderRadius,
    borderTop,
    borderWidth,
    bottom,
    color,
    cursor,
    display,
    flex,
    flexShrink,
    flexWrap,
    fontSize,
    fontWeight,
    gap,
    gridColumn,
    h,
    inset,
    justify,
    justifyContent,
    left,
    letterSpacing,
    lineHeight,
    mb,
    ml,
    mr,
    mt,
    mx,
    my,
    maxH,
    maxW,
    minW,
    overflow,
    overflowX,
    p,
    pb,
    pl,
    position,
    pr,
    pt,
    px,
    py,
    right,
    scrollMarginTop,
    spacing,
    textAlign,
    textDecoration,
    textTransform,
    top,
    transition,
    w,
    zIndex,
    _hover,
    className,
    size,
    style,
    variant,
    ...rest
  } = props;
  return rest;
}

export function Box({ as: Comp = "div", children, ...props }) {
  return <Comp className={joinClassName(props.className, displayClass(props.display))} style={commonStyle(props)} {...clean(props)}>{children}</Comp>;
}

export function Text({ as: Comp = "p", children, ...props }) {
  return <Comp className={joinClassName(props.className, displayClass(props.display))} style={commonStyle(props)} {...clean(props)}>{children}</Comp>;
}

export function Heading({ as: Comp = "h2", size, children, ...props }) {
  const style = commonStyle(props);
  if (!props.fontSize) {
    if (size && typeof size === "object") {
      applyResponsive(style, { fontSize: size }, { fontSize: { name: "fs", css: ["fontSize"], map: (v) => headingSizes[v] || "2rem" } });
    } else {
      style.fontSize ||= headingSizes[size] || "2rem";
    }
  }
  style.fontWeight ||= 600;
  style.lineHeight ||= 1.2;
  return <Comp className={props.className} style={style} {...clean(props)}>{children}</Comp>;
}

export function Container({ children, ...props }) {
  const style = commonStyle(props);
  style.maxWidth = pick(props.maxW) || "1200px";
  style.width = "100%";
  style.marginLeft = "auto";
  style.marginRight = "auto";
  style.paddingLeft ||= "16px";
  style.paddingRight ||= "16px";
  return <div style={style} {...clean(props)}>{children}</div>;
}

export function Grid({ children, templateColumns, columns, ...props }) {
  const style = commonStyle(props);
  if (templateColumns && typeof templateColumns === "object") {
    applyResponsive(style, { templateColumns }, { templateColumns: { name: "tc", css: ["gridTemplateColumns"], map: (v) => v } });
  } else if (templateColumns) {
    style.gridTemplateColumns = templateColumns;
  } else if (columns) {
    style.gridTemplateColumns = `repeat(${pick(columns)}, minmax(0, 1fr))`;
  }
  style.display = "grid";
  return <div className={props.className} style={style} {...clean(props)}>{children}</div>;
}

const GRID_COLS = {
  base: { 1: "grid-cols-1", 2: "grid-cols-2", 3: "grid-cols-3", 4: "grid-cols-4" },
  sm: { 1: "sm:grid-cols-1", 2: "sm:grid-cols-2", 3: "sm:grid-cols-3", 4: "sm:grid-cols-4" },
  md: { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-3", 4: "md:grid-cols-4" },
  lg: { 1: "lg:grid-cols-1", 2: "lg:grid-cols-2", 3: "lg:grid-cols-3", 4: "lg:grid-cols-4" },
};

export function SimpleGrid({ children, columns = 1, ...props }) {
  const style = commonStyle(props);
  const responsive = typeof columns === "object" && columns !== null ? columns : { base: columns };
  const colClasses = Object.entries(responsive).map(([bp, n]) => GRID_COLS[bp]?.[n]);
  if (typeof props.display !== "object") style.display = "grid";
  return <div className={joinClassName(props.className, displayClass(props.display), ...colClasses)} style={style} {...clean(props)}>{children}</div>;
}

export function HStack({ children, ...props }) {
  const style = commonStyle(props);
  style.display = typeof props.display === "object" ? undefined : (props.display || "flex");
  style.alignItems ||= "center";
  return <div className={joinClassName(props.className, displayClass(props.display))} style={style} {...clean(props)}>{children}</div>;
}

export function VStack({ children, ...props }) {
  const style = commonStyle(props);
  style.display = pick(props.display) || "flex";
  style.flexDirection = "column";
  style.alignItems = props.align === "stretch" ? "stretch" : props.align === "start" ? "flex-start" : (props.alignItems || "center");
  return <div style={style} {...clean(props)}>{children}</div>;
}

export function Button({ as: Comp, href, children, leftIcon, ...props }) {
  const Element = Comp || (href ? Link : "button");
  const style = commonStyle(props);
  style.borderRadius ||= "9999px";
  style.border ||= props.variant === "outline" ? "1px solid #008f82" : "1px solid transparent";
  style.background ||= props.variant === "outline" ? "transparent" : "#008f82";
  style.color ||= props.variant === "outline" ? "#00695f" : "#ffffff";
  style.display = "inline-flex";
  style.alignItems = "center";
  style.justifyContent = "center";
  style.gap ||= "8px";
  style.minHeight ||= props.size === "lg" ? "48px" : "40px";
  style.paddingLeft ||= props.size === "lg" ? "24px" : "20px";
  style.paddingRight ||= props.size === "lg" ? "24px" : "20px";
  style.fontWeight ||= 700;
  const rest = clean(props);
  return <Element href={href} style={style} {...rest}>{leftIcon}{children}</Element>;
}
