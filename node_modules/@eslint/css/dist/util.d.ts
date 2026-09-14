/**
 * @fileoverview Utility functions for ESLint CSS plugin.
 * @author Nicholas C. Zakas
 */
import type { SyntaxMatchError, SyntaxReferenceError } from "@eslint/css-tree";
/**
 * @import { SyntaxMatchError, SyntaxReferenceError } from "@eslint/css-tree"
 */
/**
 * Determines if an error is a syntax match error.
 * @param {Object} error The error object to check.
 * @returns {error is SyntaxMatchError} True if the error is a syntax match error, false if not.
 */
export declare function isSyntaxMatchError(error: any): error is SyntaxMatchError;
/**
 * Determines if an error is a syntax reference error.
 * @param {Object} error The error object to check.
 * @returns {error is SyntaxReferenceError} True if the error is a syntax reference error, false if not.
 */
export declare function isSyntaxReferenceError(error: any): error is SyntaxReferenceError;
/**
 * Determines if an error is the lexer error thrown when a value containing
 * `env()` cannot be matched against a syntax definition.
 * @param {Object} error The error object to check.
 * @returns {boolean} True if the error is the `env()` match error, false if not.
 */
export declare function isEnvMatchError(error: any): boolean;
