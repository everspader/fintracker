/**
 * Array of public routes
 * These routes do not require authentication
 * @type {string[]}
 */
export const publicRoutes = ["/", "/dashboard"];

/**
 * Array of routes that require authentication
 * These routes will redirect logged in users to /settings
 * @type {string[]}
 */
export const authRoutes = ["/auth/signin", "/auth/singup", "/auth/error"];

/**
 * Prefix for API authentication routes
 * Routes that begin with this prefix are used for API authentication purposes
 * @type {string}
 */
export const apiAuthPrefix = "/api/auth";

/**
 * Default redirect path after login
 * @type {string}
 */
export const DEFAULT_LOGIN_REDIRECT = "/dashboard";
