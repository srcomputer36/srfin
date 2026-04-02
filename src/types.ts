export interface User {
  id: string;
  name: string;
  phone: string;
  isWinner: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string; // YYYY-MM-DD
  createdAt: string;
  isProcessed?: boolean;
}

export interface LotteryResult {
  id: string;
  winnerId: string;
  amountWon: number;
  drawDate: any; // Can be string (ISO) or Firestore Timestamp
  isProcessed?: boolean;
}
