import { timeout } from ".";

export const waitTx = async (library, txId, retry = 0) => {
    if (retry >= 30) throw new Error('Could not find transaction');

    const txInfo = await library.trx.getTransactionInfo(txId);
    if (!Object.keys(txInfo).length) {
        await timeout(6000);
        return waitTx(library, txId, retry + 1);
    }

    return txInfo;
};
