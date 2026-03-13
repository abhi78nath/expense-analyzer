/**
 * Returns either 'white' or 'black' based on the input hex color's brightness.
 * Uses the YIQ formula to determine contrast.
 */
export function getContrastColor(hexColor: string): "white" | "black" {
    // If no color or invalid color, default to white
    if (!hexColor || !hexColor.startsWith("#")) return "white";

    // Convert hex to RGB
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate YIQ brightness (0-255)
    // Formula: (R * 299 + G * 587 + B * 114) / 1000
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;

    // If yiq is 128 or higher, it's a light color, so use black text. 
    // Otherwise, it's dark, so use white text.
    return yiq >= 128 ? "black" : "white";
}

/**
 * Capitalizes the first letter of a string and lowercases the rest.
 */
export function capitalize(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
