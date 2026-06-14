import definePlugin from "@utils/types";
import { WindowStore } from "@webpack/common";

let originalIsFocused: (() => boolean) | undefined;
let originalIsVisible: (() => boolean) | undefined;

export default definePlugin({
    name: "AlwaysFocused",
    description: "Makes Discord always think its window is focused",
    authors: [{ name: "yeongaori", id: 602447697047191562n }],

    start() {
        const store = WindowStore as any;
        originalIsFocused = store.isFocused?.bind(store);
        originalIsVisible = store.isVisible?.bind(store);

        store.isFocused = () => true;
        if (originalIsVisible) store.isVisible = () => true;

        store.emitChange?.();
    },

    stop() {
        const store = WindowStore as any;
        if (originalIsFocused) store.isFocused = originalIsFocused;
        if (originalIsVisible) store.isVisible = originalIsVisible;

        store.emitChange?.();
    }
});
