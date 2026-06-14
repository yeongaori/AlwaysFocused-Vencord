import definePlugin from "@utils/types";
import { FluxDispatcher, WindowStore } from "@webpack/common";

let active = false;
let interceptorAdded = false;

const block = (e: Event) => {
    if (!e.isTrusted) return;
    e.stopImmediatePropagation();
};

const interceptor = (action: any) => {
    if (!active) return false;
    return action?.type === "WINDOW_UNFOCUS";
};

let originalHasFocus: typeof document.hasFocus;
let originalIsFocused: (() => boolean) | undefined;
let originalIsVisible: (() => boolean) | undefined;

export default definePlugin({
    name: "AlwaysFocused",
    description: "Makes Discord always think its window is focused",
    authors: [{ name: "yeongaori", id: 602447697047191562n }],

    start() {
        active = true;

        originalHasFocus = document.hasFocus.bind(document);
        document.hasFocus = () => true;

        const store = WindowStore as any;
        originalIsFocused = store.isFocused?.bind(store);
        originalIsVisible = store.isVisible?.bind(store);
        store.isFocused = () => true;
        if (originalIsVisible) store.isVisible = () => true;

        if (!interceptorAdded) {
            (FluxDispatcher as any).addInterceptor(interceptor);
            interceptorAdded = true;
        }

        window.addEventListener("blur", block, true);
        document.addEventListener("visibilitychange", block, true);
        document.addEventListener("webkitvisibilitychange", block, true);

        FluxDispatcher.dispatch({ type: "WINDOW_FOCUS", focused: true } as any);
    },

    stop() {
        active = false;

        if (originalHasFocus) document.hasFocus = originalHasFocus;

        const store = WindowStore as any;
        if (originalIsFocused) store.isFocused = originalIsFocused;
        if (originalIsVisible) store.isVisible = originalIsVisible;

        window.removeEventListener("blur", block, true);
        document.removeEventListener("visibilitychange", block, true);
        document.removeEventListener("webkitvisibilitychange", block, true);
    }
});
