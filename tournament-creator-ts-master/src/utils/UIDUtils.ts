export class UIDUtils {
    static counter = Date.now() % 1e9;

    public static getUid(): number {
        return (Math.random() * 1e9 >>> 0) + (UIDUtils.counter++);
    }
}