const fs = require('fs');
const path = require('path');

const CONFIG_DIR = 'D:\\LDPlayer\\LDPlayer9\\vms\\config';
const MODELS = [
    { brand: 'samsung', model: 'SM-S918B' }, // S23 Ultra
    { brand: 'samsung', model: 'SM-G998B' }, // S21 Ultra
    { brand: 'google', model: 'Pixel 8 Pro' },
    { brand: 'google', model: 'Pixel 7 Pro' },
    { brand: 'google', model: 'Pixel 6 Pro' },
    { brand: 'oneplus', model: 'NE2213' },   // 10 Pro
    { brand: 'oneplus', model: 'LE2123' },   // 9 Pro
    { brand: 'samsung', model: 'SM-S908B' }, // S22 Ultra
    { brand: 'samsung', model: 'SM-F936B' }, // Z Fold 4
    { brand: 'samsung', model: 'SM-A546B' }  // A54 5G
];

function genIMEI() {
    let res = '86';
    for (let i = 0; i < 13; i++) res += Math.floor(Math.random() * 10);
    return res;
}

function genAndroidId() {
    return Math.random().toString(16).slice(2, 18);
}

function genMAC() {
    return '00DB' + Math.random().toString(16).slice(2, 10).toUpperCase();
}

function randomize(index) {
    // Handling LDPlayer naming: the first is 'leidian0.config', others are 'leidian1.config' etc.
    // NOTE: My earlier check showed 'leidian0.config' exists.
    const filePath = path.join(CONFIG_DIR, `leidian${index}.config`);
    if (!fs.existsSync(filePath)) {
        console.log(`⚠️  [Identity] Config not found for instance ${index}: ${filePath}`);
        return;
    }

    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const device = MODELS[index % MODELS.length];

    data['propertySettings.phoneIMEI'] = genIMEI();
    data['propertySettings.phoneAndroidId'] = genAndroidId();
    data['propertySettings.phoneModel'] = device.model;
    data['propertySettings.phoneManufacturer'] = device.brand;
    data['propertySettings.macAddress'] = genMAC();

    fs.writeFileSync(filePath, JSON.stringify(data, null, 4));
    console.log(`✅ [Identity] Instance ${index} (${device.brand} ${device.model}) Randomized.`);
}

console.log('💎 INITIALIZING 25-USER IDENTITY SHUFFLE...');
for (let i = 0; i < 25; i++) {
    randomize(i);
}
