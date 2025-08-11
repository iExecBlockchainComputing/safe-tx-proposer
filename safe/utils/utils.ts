import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Convert hex string to decimal string
 */
export function convertHexToDecimal(hexValue: string): string {
    if (!hexValue || hexValue === '0x' || hexValue === '0x0') {
        return '0';
    }

    // Remove 0x prefix if present
    const cleanHex = hexValue.startsWith('0x') ? hexValue.slice(2) : hexValue;

    // Convert to decimal
    const decimal = parseInt(cleanHex, 16);

    if (isNaN(decimal)) {
        process.stderr.write(`Invalid hex value: ${hexValue}, using 0\n`);
        return '0';
    }

    return decimal.toString();
}

/**
 * Get chain ID from RPC connection to the blockchain
 */
export async function getChainIdFromRpc(rpcUrl: string): Promise<string> {
    try {
        process.stdout.write(`Fetching chain ID from RPC: ${rpcUrl}\n`);

        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const network = await provider.getNetwork();
        const chainId = network.chainId.toString();

        process.stdout.write(`Chain ID retrieved: ${chainId}\n`);
        return chainId;
    } catch (error) {
        process.stderr.write(`Failed to fetch chain ID from RPC: ${String(error)}\n`);

        // Fallback to hardcoded mapping as a last resort
        process.stdout.write('Falling back to hardcoded chain ID mapping...\n');
        const chainMappings: Record<string, string> = {
            sepolia: '11155111',
            'arbitrum-sepolia': '421614',
            ethereum: '1',
            arbitrum: '42161',
            localhost: '31337',
            '127.0.0.1': '31337',
            hardhat: '31337',
        };

        const url = rpcUrl.toLowerCase();
        for (const [network, chainId] of Object.entries(chainMappings)) {
            if (url.includes(network)) {
                process.stdout.write(`Using fallback chain ID: ${chainId}\n`);
                return chainId;
            }
        }

        // Default to Sepolia if cannot determine
        process.stdout.write('Using default chain ID: 11155111 (Sepolia)\n');
        return '11155111';
    }
}

/**
 * Parse environment variables from string format: "KEY1=value1 KEY2=value2"
 */
export function parseEnvironmentVariables(envVars: string): Record<string, string> {
    const result: Record<string, string> = {};
    const envPairs = envVars.trim().split(/\s+/);

    envPairs.forEach((pair) => {
        const [key, value] = pair.split('=');
        if (key && value) {
            result[key] = value;
        }
    });

    return result;
}

/**
 * Get available scripts from broadcast directory
 */
export function getAvailableScripts(): string[] {
    const broadcastDir = path.join(process.cwd(), 'broadcast');
    if (!fs.existsSync(broadcastDir)) {
        return [];
    }

    return fs
        .readdirSync(broadcastDir)
        .filter((item) => item.endsWith('.s.sol'))
        .map((item) => item.replace('.s.sol', ''));
}

/**
 * Sleep for a specified number of milliseconds
 */
export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Read JSON file safely
 */
export function readJsonFile<T = unknown>(filePath: string): T {
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent) as T;
}

/**
 * Convert address to checksum format
 */
export function toChecksumAddress(address: string): string {
    try {
        return ethers.getAddress(address);
    } catch {
        process.stderr.write(`Invalid address format: ${address}\n`);
        return address; // Return original if conversion fails
    }
}

/**
 * Get broadcast file path
 */
export function getBroadcastFilePath(scriptName: string, chainId: string): string {
    const baseDir = path.join(process.cwd(), 'broadcast', `${scriptName}.s.sol`, chainId);
    
    if (!fs.existsSync(baseDir)) {
        throw new Error(`Broadcast directory not found: ${baseDir}`);
    }
    
    // Find timestamped files (run-TIMESTAMP.json) excluding run-latest.json
    const files = fs.readdirSync(baseDir)
        .filter(file => 
            file.startsWith('run-') && 
            file.endsWith('.json') && 
            file !== 'run-latest.json' &&
            /^run-\d+\.json$/.test(file) // Ensure it matches the timestamp pattern
        )
        .sort((a, b) => {
            // Extract timestamp from filename (run-TIMESTAMP.json)
            const timestampA = parseInt(a.replace('run-', '').replace('.json', ''));
            const timestampB = parseInt(b.replace('run-', '').replace('.json', ''));
            return timestampB - timestampA; // Sort descending (most recent first)
        });
    
    if (files.length === 0) {
        throw new Error(`No timestamped broadcast files found in ${baseDir}. Make sure the Foundry script ran successfully.`);
    }
    
    const mostRecentFile = path.join(baseDir, files[0]);
    process.stdout.write(`Using broadcast file: ${files[0]}\n`);
    return mostRecentFile;
}
