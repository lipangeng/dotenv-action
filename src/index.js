const core = require('@actions/core');
const fs = require('fs');
const path = require('path');

async function run() {
    try {
        const filesInput = core.getInput('files', { required: true });
        const filterInput = core.getInput('filter') || '.*';
        const isExport = core.getInput('export') === 'true';
        const isMask = core.getInput('mask') === 'true';

        // Parse multiline file paths
        const files = filesInput.split('\n').map(f => f.trim()).filter(f => f !== '');
        const filterRegex = new RegExp(filterInput);
        const allVariables = new Map();

        for (const file of files) {
            const filePath = path.resolve(process.cwd(), file);

            if (!fs.existsSync(filePath)) {
                core.warning(`File not found: ${filePath}`);
                continue;
            }

            core.info(`Processing: ${file}`);
            const content = fs.readFileSync(filePath, 'utf8');
            const lines = content.split(/\r?\n/);

            for (let line of lines) {
                line = line.trim();
                if (!line || line.startsWith('#')) continue;

                // Matches KEY=VALUE
                const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
                if (!match) continue;

                const key = match[1].trim();
                let rawValue = (match[2] || '').trim();
                let value = rawValue;

                // Handle quotes and inline comments
                if (value.startsWith('"') || value.startsWith("'")) {
                    const quote = value[0];
                    const endQuoteIndex = value.indexOf(quote, 1);
                    if (endQuoteIndex !== -1) {
                        value = value.substring(1, endQuoteIndex);
                    }
                } else {
                    // Truncate inline comments for unquoted values
                    const hashIndex = value.indexOf('#');
                    if (hashIndex !== -1) {
                        value = value.substring(0, hashIndex).trim();
                    }
                }

                if (!filterRegex.test(key)) continue;

                if (isMask) {
                    core.setSecret(value);
                }

                // Store variable (latter files override previous ones)
                allVariables.set(key, value);

                // Export to Step Outputs
                core.setOutput(key, value);

                // Export to Global GITHUB_ENV
                if (isExport) {
                    core.exportVariable(key, value);
                }
            }
        }

        // Generate combined output for build-args
        let combinedStr = '';
        for (const [key, val] of allVariables) {
            combinedStr += `${key}=${val}\n`;
        }
        core.setOutput('combined', combinedStr.trim());

        core.info('Environment variables loaded successfully.');
    } catch (error) {
        core.setFailed(`Action failed: ${error.message}`);
    }
}

run();