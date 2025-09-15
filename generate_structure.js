const fs = require('fs');
const path = require('path');

const guidelinesDir = './guidelines';
const outputFile = './guideline_structure.json';

function getDirectoryStructure(dirPath) {
    const items = fs.readdirSync(dirPath);
    const structureMap = new Map();

    // First pass: Group files by their base name
    items.forEach(item => {
        if (item.startsWith('.')) return;

        const fullPath = path.join(dirPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
            // Handle directories recursively
            const children = getDirectoryStructure(fullPath);
            if (children.length > 0) {
                const cleanName = item.replace(/_/g, ' ').replace(/^\d+_/,'');
                structureMap.set(item, { name: cleanName, type: 'directory', children });
            }
        } else if (item.endsWith('.md')) {
            // Group language files together
            const baseName = item.replace(/_en\.md|_tr\.md/, '');
            const lang = item.endsWith('_en.md') ? 'en' : 'tr';
            const cleanName = path.basename(baseName, '.md').replace(/_/g, ' ').replace(/^\d+_/,'');
            
            if (!structureMap.has(baseName)) {
                structureMap.set(baseName, { name: cleanName, type: 'file', paths: {} });
            }
            structureMap.get(baseName).paths[lang] = fullPath.replace(/\\/g, '/');
        }
    });

    return Array.from(structureMap.values());
}

try {
    const structure = getDirectoryStructure(guidelinesDir);
    fs.writeFileSync(outputFile, JSON.stringify(structure, null, 2));
    console.log(`✅ Successfully created ${outputFile}`);
} catch (error) {
    console.error(`❌ Error generating structure: ${error.message}`);
}