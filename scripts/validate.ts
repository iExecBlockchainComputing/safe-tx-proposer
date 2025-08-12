#!/usr/bin/env ts-node

/**
 * Environment validation script
 */

import 'dotenv/config';
import { Validator } from '../safe/validation';

async function validateEnvironment(): Promise<void> {
    console.log('🔍 Validating environment configuration...\n');

    const result = Validator.validateEnvironmentVariables(process.env as Record<string, unknown>);

    if (result.isValid) {
        console.log('✅ Environment validation PASSED');
        
        if (result.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            result.warnings.forEach(warning => console.log(`   - ${warning}`));
        }
        
        console.log('\n🚀 Ready to execute Safe transactions!');
        process.exit(0);
    } else {
        console.log('❌ Environment validation FAILED');
        
        if (result.errors.length > 0) {
            console.log('\n🚨 Errors:');
            result.errors.forEach(error => console.log(`   - ${error}`));
        }
        
        if (result.warnings.length > 0) {
            console.log('\n⚠️  Warnings:');
            result.warnings.forEach(warning => console.log(`   - ${warning}`));
        }

        console.log('\n💡 Please check your .env file and ensure all required environment variables are set.');
        process.exit(1);
    }
}

// Run validation
validateEnvironment().catch((error) => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
});
