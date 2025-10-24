import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure artifacts directory exists
const artifactsDir = path.join(__dirname, '..', 'artifacts');
if (!fs.existsSync(artifactsDir)) {
    fs.mkdirSync(artifactsDir, { recursive: true });
}

console.log("🔨 Compiling Smart Contracts...");

// Use solc to compile contracts
const solc = './node_modules/.bin/solc';
const contractsDir = path.join(__dirname, '..', 'src', 'contracts');

const compileCommand = `${solc} --optimize --optimize-runs 200 ` +
    `--base-path ${contractsDir} ` +
    `--include-path ${path.join(__dirname, '..', 'node_modules')} ` +
    `--output-dir ${artifactsDir} ` +
    `--combined-json abi,bin ` +
    `${path.join(contractsDir, '*.sol')}`;

exec(compileCommand, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Compilation error: ${error}`);
        return;
    }
    if (stderr) {
        console.error(`⚠️ Compilation warnings: ${stderr}`);
    }
    console.log("✅ Contracts compiled successfully!");
    
    // Parse the combined output
    const combined = JSON.parse(stdout);
    
    // Create separate files for each contract
    Object.entries(combined.contracts).forEach(([contractPath, contractInfo]) => {
        const contractName = path.basename(contractPath, '.sol');
        const artifactPath = path.join(artifactsDir, 'contracts', contractName);
        
        // Create contract directory
        fs.mkdirSync(artifactPath, { recursive: true });
        
        // Write artifact file
        fs.writeFileSync(
            path.join(artifactPath, `${contractName}.json`),
            JSON.stringify({
                abi: JSON.parse(contractInfo.abi),
                bytecode: `0x${contractInfo.bin}`,
                deployedBytecode: `0x${contractInfo.bin}`,
            }, null, 2)
        );
    });
});