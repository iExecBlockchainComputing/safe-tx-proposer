/**
 * Convert hex string to decimal string
 */
export declare function convertHexToDecimal(hexValue: string): string;
/**
 * Get chain ID from RPC connection to the blockchain
 */
export declare function getChainIdFromRpc(rpcUrl: string): Promise<string>;
/**
 * Parse environment variables from string format: "KEY1=value1 KEY2=value2"
 */
export declare function parseEnvironmentVariables(envVars: string): Record<string, string>;
/**
 * Get available scripts from broadcast directory
 */
export declare function getAvailableScripts(): string[];
/**
 * Sleep for a specified number of milliseconds
 */
export declare function sleep(ms: number): Promise<void>;
/**
 * Read JSON file safely
 */
export declare function readJsonFile<T = unknown>(filePath: string): T;
/**
 * Convert address to checksum format
 */
export declare function toChecksumAddress(address: string): string;
/**
 * Get broadcast file path
 */
export declare function getBroadcastFilePath(scriptName: string, chainId: string): string;
//# sourceMappingURL=utils.d.ts.map