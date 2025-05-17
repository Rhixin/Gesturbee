const { getDefaultConfig } = require("@expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

// Get the default config
const config = getDefaultConfig(__dirname);

// Ensure asset extensions include 'bin' and 'json' (no duplicates)
config.resolver.assetExts = Array.from(
  new Set([...config.resolver.assetExts, "bin", "json"])
);

// Apply NativeWind transformation
module.exports = withNativeWind(config, {
  input: "./global.css", // Update if your Tailwind config input path changes
});
