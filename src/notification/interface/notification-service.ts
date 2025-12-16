export interface NotificationService {
    notifyPollClosed(input: {
        to: string;
        pollTitle: string;
        closedAt: Date;
        winnerOption: string;
        totalVotes: number;
    }): Promise<void>;
}
