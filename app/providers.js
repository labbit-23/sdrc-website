"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { siteSystem } from "@/lib/chakraTheme";

export default function Providers({ children }) {
  return <ChakraProvider value={siteSystem}>{children}</ChakraProvider>;
}
