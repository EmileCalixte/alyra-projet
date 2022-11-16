export default class Util {
    constructor() {
        throw new Error("This class cannot be instanciated");
    }

    static areAddressesEqual(address1: string, address2: string): boolean {
        if (address1.toLowerCase() !== address2.toLowerCase()) {
            return false;
        }

        try {
            return BigInt(address1) === BigInt(address2);
        } catch {
            return false;
        }
    }
}
