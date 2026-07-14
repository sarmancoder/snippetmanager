export default function deepEqual(obj1: any, obj2: any): boolean {
    if (obj1 === obj2) return true;

    // Si son strings, normalizamos los espacios en blanco invisibles antes de comparar
    if (typeof obj1 === 'string' && typeof obj2 === 'string') {
        const normalize = (str: string) => str.replace(/\s+/g, ' ').trim();
        return normalize(obj1) === normalize(obj2);
    }

    if (typeof obj1 !== 'object' || obj1 === null || typeof obj2 !== 'object' || obj2 === null) {
        return false;
    }

    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
        if (!keys2.includes(key) || !deepEqual(obj1[key], obj2[key])) {
            return false;
        }
    }

    return true;
}