/**
 * Configuration types for the contrast specification system
 */

// ============================================================================
// Configuration Types
// ============================================================================

/**
 * Theme-specific configuration settings
 */
export interface ThemeConfig {
  /**
   * Minimum contrast ratio for normal text (default: 4.5)
   */
  normalTextRatio?: number;
  
  /**
   * Minimum contrast ratio for large text (default: 3)
   */
  largeTextRatio?: number;
  
  /**
   * Background colors for opacity calculations
   */
  backgroundColors?: string[];
}

/**
 * Main configuration interface for the contrast system
 */
export interface ContrastConfig {
  /**
   * Minimum contrast ratios for different text sizes
   */
  minimumRatios?: {
    /**
     * Default minimum ratio for normal text (default: 4.5)
     */
    normalText?: number;
    
    /**
     * Default minimum ratio for large text (default: 3)
     */
    largeText?: number;
  };
  
  /**
   * Glob patterns for CSS selectors to exclude from analysis
   */
  exclusions?: {
    /**
     * CSS selectors to skip during analysis
     */
    selectors?: string[];
    
    /**
     * Glob patterns for file paths to exclude
     */
    files?: string[];
  };
  
  /**
   * Fix behavior mode
   * - 'auto-fix': Automatically apply fixes without confirmation
   * - 'review-only': Show fixes but don't apply them
   * - 'manual-only': Only mark elements as needing manual review
   */
  fixBehavior?: 'auto-fix' | 'review-only' | 'manual-only';
  
  /**
   * Theme-specific settings
   */
  themes?: {
    /**
     * Light theme configuration
     */
    light?: ThemeConfig;
    
    /**
     * Dark theme configuration
     */
    dark?: ThemeConfig;
  };
  
  /**
   * Background colors to use for opacity calculations (default: ['#ffffff'])
   */
  backgroundColors?: string[];
}

/**
 * Resolved configuration with defaults applied
 */
export interface ResolvedConfig extends ContrastConfig {
  minimumRatios: {
    normalText: number;
    largeText: number;
  };
  
  exclusions: {
    selectors: string[];
    files: string[];
  };
  
  fixBehavior: 'auto-fix' | 'review-only' | 'manual-only';
  
  themes: {
    light: ThemeConfig;
    dark: ThemeConfig;
  };
  
  backgroundColors: string[];
}

// ============================================================================
// Configuration File Types
// ============================================================================

/**
 * Raw configuration file format (JSON)
 */
export interface RawConfigFile {
  minimumRatios?: {
    normalText?: number;
    largeText?: number;
  };
  
  exclusions?: {
    selectors?: string[];
    files?: string[];
  };
  
  fixBehavior?: 'auto-fix' | 'review-only' | 'manual-only';
  
  themes?: {
    light?: {
      normalTextRatio?: number;
      largeTextRatio?: number;
      backgroundColors?: string[];
    };
    dark?: {
      normalTextRatio?: number;
      largeTextRatio?: number;
      backgroundColors?: string[];
    };
  };
  
  backgroundColors?: string[];
}
