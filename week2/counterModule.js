export let clickCount = 0;

export function increment() {
    clickCount = clickCount + 1;
};

export default function reset() {
    clickCount = 0;
};

//