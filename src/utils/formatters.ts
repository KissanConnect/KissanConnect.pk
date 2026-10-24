export function formatPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  return 'Rs. ' + amount.toLocaleString('en-PK');
}

export function formatCompactPKR(amount: number): string {
  if (isNaN(amount)) return 'Rs. 0';
  if (amount >= 10000000) {
    const crore = (amount / 10000000).toFixed(2);
    return `Rs. ${crore} Crore`;
  }
  if (amount >= 100000) {
    const lakh = (amount / 100000).toFixed(2);
    return `Rs. ${lakh} Lakh`;
  }
  return formatPKR(amount);
}

export function formatDate(dateString: string, isUrdu = false): string {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString(isUrdu ? 'ur-PK' : 'en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function timeAgo(dateString: string, isUrdu = false): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return isUrdu ? 'ابھی ابھی' : 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return isUrdu ? `${minutes} منٹ پہلے` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return isUrdu ? `${hours} گھنٹے پہلے` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return isUrdu ? `${days} دن پہلے` : `${days}d ago`;
    return formatDate(dateString, isUrdu);
  } catch {
    return dateString;
  }
}
