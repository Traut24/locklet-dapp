import { formatUnits } from '@ethersproject/units';
import { BigNumber } from 'ethers';

export const toLockWithRecipients = (data, side = null) => {
    const lockWithRecipients = {
        id: data.index,
        idAsNumber: parseFloat(formatUnits(data.index, 0)),
        
        creationTime: new Date(data.lock.creationTime.toNumber() * 1000),
        tokenAddress: data.lock.tokenAddress,
        startTime: new Date(data.lock.startTime.toNumber() * 1000),
        durationInDays: data.lock.durationInDays,
        initiatorAddress: data.lock.initiatorAddress,
        isRevocable: data.lock.isRevocable,
        isRevoked: data.lock.isRevoked,
        isActive: data.lock.isActive,
        
        recipients: [],

        totalAmount: BigNumber.from(0),
        side: side,
        isInitiator: side == 'Initiator',
        isLinear: data.lock.durationInDays > 1
    };

    for (let recipient of data.recipients) {
        const lockRecipient = {
            recipientAddress: recipient.recipientAddress,
            amount: recipient.amount,
            daysClaimed: recipient.daysClaimed,
            amountClaimed: recipient.amountClaimed,
            isActive: recipient.isActive
        }

        lockWithRecipients.recipients.push(lockRecipient);
        lockWithRecipients.totalAmount = lockWithRecipients.totalAmount.add(recipient.amount);
    }

    return lockWithRecipients;
}