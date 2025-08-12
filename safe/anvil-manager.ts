import { ChildProcess, spawn } from 'child_process';
import { logger } from './logger';

export interface AnvilConfig {
    port?: number;
    host?: string;
    forkUrl: string;
    timeout?: number;
    accounts?: number;
    balance?: number;
    unlockAccount?: string;
}

// Type for JSON-RPC response
type JsonRpcResponse = {
    error?: { message: string };
};

export class AnvilManager {
    private anvilProcess: ChildProcess | null = null;
    private isStarted: boolean = false;

    /**
     * Check if Anvil is available on the system
     */
    async checkAvailability(): Promise<boolean> {
        return new Promise((resolve) => {
            const checkProcess = spawn('anvil', ['--version'], {
                stdio: 'pipe',
            });

            checkProcess.on('close', (code) => {
                resolve(code === 0);
            });

            checkProcess.on('error', () => {
                resolve(false);
            });

            // Timeout after 5 seconds
            setTimeout(() => {
                checkProcess.kill();
                resolve(false);
            }, 5000);
        });
    }

    /**
     * Start an Anvil fork from the given RPC URL
     */
    async startFork(config: AnvilConfig): Promise<ChildProcess> {
        return new Promise((resolve, reject) => {
            const port = config.port || 8545;
            const host = config.host || '0.0.0.0';
            const timeout = config.timeout || 30000;
            const accounts = config.accounts || 10;
            const balance = config.balance || 10000;

            logger.info(`Starting Anvil fork from: ${config.forkUrl}`);

            const anvilArgs = [
                '--fork-url',
                config.forkUrl,
                '--host',
                host,
                '--port',
                port.toString(),
                '--accounts',
                accounts.toString(),
                '--balance',
                balance.toString(),
            ];

            // Add auto-impersonate if we have an account to unlock
            if (config.unlockAccount) {
                anvilArgs.push('--auto-impersonate');
                logger.info(
                    `Auto-impersonate enabled for account: ${config.unlockAccount}`,
                );
            }

            logger.info(`Anvil command: anvil ${anvilArgs.join(' ')}`);

            this.anvilProcess = spawn('anvil', anvilArgs, {
                cwd: process.cwd(),
                stdio: ['ignore', 'pipe', 'pipe'], // Capture stdout and stderr
                env: { ...process.env },
            });

            let startupComplete = false;

            // Monitor stdout for startup confirmation
            this.anvilProcess.stdout?.on('data', (data: Buffer) => {
                const output = String(data);
                logger.info(`Anvil: ${output.trim()}`);

                // Look for the "Listening on" message to confirm startup
                if (output.includes('Listening on') && !startupComplete) {
                    startupComplete = true;
                    this.isStarted = true;
                    logger.info(`Anvil fork started successfully on ${host}:${port}`);

                    // Fund the unlock account after startup
                    if (config.unlockAccount) {
                        this.fundUnlockAccount(config.unlockAccount, balance, host, port).catch(
                            (error) => {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                logger.error(`Failed to fund unlock account: ${errorMessage}`);
                            },
                        );
                    }

                    resolve(this.anvilProcess!);
                }
            });

            // Monitor stderr for errors
            this.anvilProcess.stderr?.on('data', (data: Buffer) => {
                const errorOutput = String(data);
                logger.error(`Anvil Error: ${errorOutput.trim()}`);
            });

            this.anvilProcess.on('error', (error) => {
                if (!startupComplete) {
                    this.cleanup();
                    reject(new Error(`Failed to start Anvil: ${error.message}`));
                }
            });

            this.anvilProcess.on('close', (code) => {
                this.isStarted = false;
                if (!startupComplete) {
                    this.cleanup();
                    reject(new Error(`Anvil process exited with code ${code} before startup`));
                }
            });

            // Timeout if Anvil doesn't start
            setTimeout(() => {
                if (!startupComplete) {
                    this.stop('startup timeout');
                    reject(new Error(`Anvil startup timeout after ${timeout / 1000} seconds`));
                }
            }, timeout);
        });
    }

    /**
     * Stop the Anvil fork process
     */
    stop(reason?: string): void {
        if (this.anvilProcess && this.isStarted) {
            const message = reason ? `Stopping Anvil fork: ${reason}` : 'Stopping Anvil fork...';
            logger.info(message);
            this.anvilProcess.kill('SIGTERM');
            this.cleanup();
        }
    }

    /**
     * Stop the Anvil process due to an error
     */
    stopOnError(): void {
        this.stop('due to error');
    }

    /**
     * Clean up internal state
     */
    private cleanup(): void {
        this.anvilProcess = null;
        this.isStarted = false;
    }

    /**
     * Check if Anvil is currently running
     */
    isRunning(): boolean {
        return this.isStarted && this.anvilProcess !== null;
    }

    /**
     * Fund unlock account using Anvil RPC calls
     */
    private async fundUnlockAccount(
        account: string,
        balance: number,
        host: string,
        port: number,
    ): Promise<void> {
        const rpcUrl = host === '0.0.0.0' ? `http://localhost:${port}` : `http://${host}:${port}`;

        // Convert balance from ETH to Wei (18 decimals)
        const balanceWei = `0x${(BigInt(balance) * BigInt(10) ** BigInt(18)).toString(16)}`;

        logger.info(`Funding unlock account ${account} with ${balance} ETH...`);

        try {
            const response = await fetch(rpcUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jsonrpc: '2.0',
                    method: 'anvil_setBalance',
                    params: [account, balanceWei],
                    id: 1,
                }),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = (await response.json()) as JsonRpcResponse;

            if (result.error) {
                throw new Error(`RPC error: ${result.error.message}`);
            }

            logger.info(`Successfully funded account ${account} with ${balance} ETH`);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            logger.error(`Failed to fund account ${account}: ${errorMessage}`);
            throw error;
        }
    }

    /**
     * Determine if a fork should be started based on RPC URL
     */
    static shouldStartFork(rpcUrl: string, skipAnvilFork: boolean = false): boolean {
        if (skipAnvilFork) {
            return false;
        }

        // Don't start fork if already using localhost
        return !rpcUrl.includes('localhost') && !rpcUrl.includes('127.0.0.1');
    }

    /**
     * Get the appropriate RPC URL for forge script execution
     */
    static getForgeRpcUrl(
        rpcUrl: string,
        anvilRunning: boolean,
        anvilConfig?: AnvilConfig,
    ): string {
        if (anvilRunning && anvilConfig) {
            // Use the configured Anvil port if we started a fork
            const port = anvilConfig.port || 8545;
            const host =
                anvilConfig.host === '0.0.0.0' ? 'localhost' : anvilConfig.host || 'localhost';
            return `http://${host}:${port}`;
        } else if (rpcUrl.includes('localhost') || rpcUrl.includes('127.0.0.1')) {
            // Use the original RPC URL if it's already localhost
            return rpcUrl;
        }

        // Default to localhost:8545
        return 'http://localhost:8545';
    }
}
