import * as d3 from "d3";

export function getFillColorName(value) {
    if (value == "#212121") {
        return "black";
    }
    if (value == "#4caf50") {
        return "green";
    }
    if (value == "#3f51b5") {
        return "blue";
    }
    if (value == "#f44336") {
        return "red";
    }
    if (value == "#ad1457") {
        return "fuchsia";
    }
    if (value == "#ffeb3b") {
        return "yellow";
    }
    if (value == "#40E0D0") {
        return "cyan";
    }
    if (value == "#A0522D") {
        return "brown";
    }
    if (value == "#006400") {
        return "darkgreen";
    }
    if (value == "#9c27b0") {
        return "purple";
    } else return "";
}

export function getColorInterpolator(value) {
    if (value == "interpolateBlues") {
        return d3.interpolateBlues;
    } else if (value == "interpolateReds") {
        return d3.interpolateReds;
    } else if (value == "interpolateRdBu") {
        return d3.interpolateRdBu;
    } else if (value == "interpolateViridis") {
        return d3.interpolateViridis;
    } else if (value == "interpolatePlasma") {
        return d3.interpolatePlasma;
    } else if (value == "interpolateCool") {
        return d3.interpolateCool;
    } else if (value == "interpolateWarm") {
        return d3.interpolateWarm;
    } else if (value == "interpolateSpectral") {
        return d3.interpolateSpectral;
    } else {
        return null;
    }
}

export function getFillColor(name, type) {
    if (name == "black") {
        if (type == "light") {
            return "#484848";
        } else if (type == "dark") {
            return "#000000";
        } else {
            return "#212121";
        }
    } else if (name == "green") {
        if (type == "light") {
            return "#80e27e";
        } else if (type == "dark") {
            return "#087f23";
        } else {
            return "#4caf50";
        }
    } else if (name == "blue") {
        if (type == "light") {
            return "#757de8";
        } else if (type == "dark") {
            return "#002984";
        } else {
            return "#3f51b5";
        }
    } else if (name == "red") {
        if (type == "light") {
            return "#ff7961";
        } else if (type == "dark") {
            return "#ba000d";
        } else {
            return "#f44336";
        }
    } else if (name == "fuchsia") {
        if (type == "light") {
            return "#e35183";
        } else if (type == "dark") {
            return "#78002e";
        } else {
            return "#ad1457";
        }
    } else if (name == "yellow") {
        if (type == "light") {
            return "#ffff72";
        } else if (type == "dark") {
            return "#c8b900";
        } else {
            return "#ffeb3b";
        }
    } else if (name == "cyan") {
        if (type == "light") {
            return "#00FFFF";
        } else if (type == "dark") {
            return "#008B8B";
        } else {
            return "#40E0D0";
        }
    } else if (name == "brown") {
        if (type == "light") {
            return "#CD853F";
        } else if (type == "dark") {
            return "#8B4513";
        } else {
            return "#A0522D";
        }
    } else if (name == "darkgreen") {
        if (type == "light") {
            return "#556B2F";
        } else if (type == "dark") {
            return "#004d00";
        } else {
            return "#006400";
        }
    } else if (name == "purple") {
        if (type == "light") {
            return "#d05ce3";
        } else if (type == "dark") {
            return "#6a0080";
        } else {
            return "#9c27b0";
        }
    } else if (name.search("interpolate") >= 0) {
        if (type == "light") {
            return "RGBA(255,255,255, 0.55)";
        } else if (type == "dark") {
            return "RGBA(0,0,0, 0.25)";
        } else {
            return "interpolator";
        }
    }
}
