export default class Util {
    constructor() {
        throw new Error("This class cannot be instanciated");
    }

    static shortenAddress(address: string, firstCharactersCount: number = 2, lastCharactersCount: number = 4): string {
        if (!address.startsWith("0x")) {
            return address;
        }

        const firstCharacters = address.slice(0, firstCharactersCount + 3);
        const lastCharacters = address.slice(lastCharactersCount * -1);

        return firstCharacters + "…" + lastCharacters;
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

    static isChainSupported(chainId: number): boolean {
        switch (chainId) {
            case 1337:
                return true;
        }

        return false;
    }
    
    static getChainName(chainId: number): string|null {
        switch (chainId) {
            case 1337:
                return 'Localhost';
        }

        return null;
    }
}
