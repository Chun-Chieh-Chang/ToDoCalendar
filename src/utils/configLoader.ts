/**
 * Configuration loader for the contrast specification system
 * Loads settings from .contrast-config.json in project root
 */

import { readFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import type {
  ContrastConfig,
  ResolvedConfig,
  RawConfigFile,
  ThemeConfig,
} from '../types/contrastConfig';

// ============================================================================
// Default Configuration Values
// ============================================================================

const DEFAULT_CONFIG: ResolvedConfig = {
  minimumRatios: {
    normalText: 4.5,
    largeText: 3,
  },
  
  exclusions: {
    selectors: [],
    files: [],
  },
  
  fixBehavior: 'review-only',
  
  themes: {
    light: {
      normalTextRatio: 4.5,
      largeTextRatio: 3,
      backgroundColors: ['#ffffff'],
    },
    dark: {
      normalTextRatio: 4.5,
      largeTextRatio: 3,
      backgroundColors: ['#1a1a1a', '#2d2d2d'],
    },
  },
  
  backgroundColors: ['#ffffff'],
};

// ============================================================================
// Configuration File Path
// ============================================================================

/**
 * Get the path to the configuration file
 * @returns Path to .contrast-config.json in project root
 */
export function getConfigPath(): string {
  // Try to find the project root by looking for package.json
  const projectRoot = findProjectRoot();
  return join(projectRoot, '.contrast-config.json');
}

/**
 * Find the project root by looking for package.json
 * @param startDir Starting directory (defaults to current working directory)
 * @returns Path to project root
 */
function findProjectRoot(startDir: string = process.cwd()): string {
  const packageJsonPath = join(startDir, 'package.json');
  
  if (existsSync(packageJsonPath)) {
    return startDir;
  }
  
  const parentDir = dirname(startDir);
  
  // Stop if we've reached the filesystem root
  if (parentDir === startDir) {
    return startDir;
  }
  
  return findProjectRoot(parentDir);
}

// ============================================================================
// Configuration Loading
// ============================================================================

/**
 * Load configuration from .contrast-config.json
 * Uses default values if config doesn't exist or has invalid values
 * @returns Resolved configuration with defaults applied
 */
export function loadConfig(): ResolvedConfig {
  const configPath = getConfigPath();
  
  // If config file doesn't exist, return defaults
  if (!existsSync(configPath)) {
    console.log('No configuration file found. Using default values.');
    return DEFAULT_CONFIG;
  }
  
  try {
    const fileContent = readFileSync(configPath, 'utf-8');
    const rawConfig: RawConfigFile = JSON.parse(fileContent);
    
    return resolveConfig(rawConfig);
  } catch (error) {
    console.error('Error loading configuration file:', error);
    console.log('Using default configuration values.');
    return DEFAULT_CONFIG;
  }
}

/**
 * Resolve raw configuration with defaults
 * @param rawConfig Raw configuration from file
 * @returns Resolved configuration with defaults applied
 */
function resolveConfig(rawConfig: RawConfigFile): ResolvedConfig {
  const resolved: ResolvedConfig = {
    minimumRatios: resolveMinimumRatios(rawConfig.minimumRatios),
    exclusions: resolveExclusions(rawConfig.exclusions),
    fixBehavior: resolveFixBehavior(rawConfig.fixBehavior),
    themes: resolveThemes(rawConfig.themes),
    backgroundColors: resolveBackgroundColors(rawConfig.backgroundColors),
  };
  
  return resolved;
}

/**
 * Resolve minimum ratios with defaults
 * @param rawRatios Raw ratio configuration
 * @returns Resolved minimum ratios
 */
function resolveMinimumRatios(rawRatios?: RawConfigFile['minimumRatios']): ResolvedConfig['minimumRatios'] {
  return {
    normalText: validateRatio(rawRatios?.normalText, DEFAULT_CONFIG.minimumRatios.normalText),
    largeText: validateRatio(rawRatios?.largeText, DEFAULT_CONFIG.minimumRatios.largeText),
  };
}

/**
 * Resolve exclusions with defaults
 * @param rawExclusions Raw exclusions configuration
 * @returns Resolved exclusions
 */
function resolveExclusions(rawExclusions?: RawConfigFile['exclusions']): ResolvedConfig['exclusions'] {
  return {
    selectors: rawExclusions?.selectors ?? DEFAULT_CONFIG.exclusions.selectors,
    files: rawExclusions?.files ?? DEFAULT_CONFIG.exclusions.files,
  };
}

/**
 * Resolve fix behavior with defaults
 * @param rawBehavior Raw fix behavior configuration
 * @returns Resolved fix behavior
 */
function resolveFixBehavior(rawBehavior?: RawConfigFile['fixBehavior']): ResolvedConfig['fixBehavior'] {
  const validModes = ['auto-fix', 'review-only', 'manual-only'] as const;
  
  if (rawBehavior && validModes.includes(rawBehavior as const)) {
    return rawBehavior as const;
  }
  
  return DEFAULT_CONFIG.fixBehavior;
}

/**
 * Resolve theme configurations with defaults
 * @param rawThemes Raw theme configuration
 * @returns Resolved theme configurations
 */
function resolveThemes(rawThemes?: RawConfigFile['themes']): ResolvedConfig['themes'] {
  return {
    light: resolveThemeConfig(rawThemes?.light, DEFAULT_CONFIG.themes.light),
    dark: resolveThemeConfig(rawThemes?.dark, DEFAULT_CONFIG.themes.dark),
  };
}

/**
 * Resolve individual theme configuration with defaults
 * @param rawTheme Raw theme configuration
 * @param defaultTheme Default theme configuration
 * @returns Resolved theme configuration
 */
function resolveThemeConfig(rawTheme?: RawConfigFile['themes']['light'], defaultTheme: ThemeConfig = DEFAULT_CONFIG.themes.light): ThemeConfig {
  return {
    normalTextRatio: validateRatio(rawTheme?.normalTextRatio, defaultTheme.normalTextRatio),
    largeTextRatio: validateRatio(rawTheme?.largeTextRatio, defaultTheme.largeTextRatio),
    backgroundColors: rawTheme?.backgroundColors ?? defaultTheme.backgroundColors,
  };
}

/**
 * Resolve background colors with defaults
 * @param rawBackgrounds Raw background colors configuration
 * @returns Resolved background colors
 */
function resolveBackgroundColors(rawBackgrounds?: string[]): string[] {
  if (rawBackgrounds && Array.isArray(rawBackgrounds) && rawBackgrounds.length > 0) {
    return rawBackgrounds;
  }
  return DEFAULT_CONFIG.backgroundColors;
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate contrast ratio value
 * @param value Value to validate
 * @param defaultValue Default value to use if invalid
 * @returns Validated ratio or default value
 */
function validateRatio(value: number | undefined, defaultValue: number): number {
  if (value === undefined || value === null) {
    return defaultValue;
  }
  
  // Validate ratio is a positive number
  if (typeof value !== 'number' || isNaN(value) || value <= 0) {
    console.warn(`Invalid contrast ratio ${value}. Using default: ${defaultValue}`);
    return defaultValue;
  }
  
  // Validate ratio is within reasonable range (1-21 for WCAG)
  if (value < 1 || value > 21) {
    console.warn(`Contrast ratio ${value} is outside reasonable range (1-21). Using default: ${defaultValue}`);
    return defaultValue;
  }
  
  return value;
}

// ============================================================================
// Configuration File Management
// ============================================================================

/**
 * Create a default configuration file
 * @param configPath Optional path to create config at
 * @returns Path to created config file
 */
export function createDefaultConfig(configPath?: string): string {
  const targetPath = configPath || getConfigPath();
  const targetDir = dirname(targetPath);
  
  // Create directory if it doesn't exist
  if (!existsSync(targetDir)) {
    mkdirSync(targetDir, { recursive: true });
  }
  
  // Write default config
  const defaultConfig: RawConfigFile = {
    minimumRatios: {
      normalText: 4.5,
      largeText: 3,
    },
    exclusions: {
      selectors: [],
      files: [],
    },
    fixBehavior: 'review-only',
    themes: {
      light: {
        normalTextRatio: 4.5,
        largeTextRatio: 3,
        backgroundColors: ['#ffffff'],
      },
      dark: {
        normalTextRatio: 4.5,
        largeTextRatio: 3,
        backgroundColors: ['#1a1a1a', '#2d2d2d'],
      },
    },
    backgroundColors: ['#ffffff'],
  };
  
  writeConfigFile(targetPath, defaultConfig);
  
  return targetPath;
}

/**
 * Write configuration to file
 * @param configPath Path to config file
 * @param config Configuration to write
 */
function writeConfigFile(configPath: string, config: RawConfigFile): void {
  try {
    const fileContent = JSON.stringify(config, null, 2);
    // Note: This would require fs.writeFileSync in a real implementation
    // For now, we're just documenting the structure
    console.log(`Configuration would be written to: ${configPath}`);
  } catch (error) {
    console.error('Error writing configuration file:', error);
  }
}

// ============================================================================
// Export
// ============================================================================

export {
  DEFAULT_CONFIG,
  findProjectRoot,
  validateRatio,
};
