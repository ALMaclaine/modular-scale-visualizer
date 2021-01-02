import {ratioToPower} from "musical-ratios";

export function scaledSize(ratio, level, size = 1) {
    return size * ratioToPower(ratio, level);
}
