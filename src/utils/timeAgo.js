export function timeAgo(dateString) {
    if (!dateString) return '';
    const diffMs = Date.now() - new Date(dateString).getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH   = Math.floor(diffMs / 3600000);
    const diffD   = Math.floor(diffMs / 86400000);

    if (diffMin < 1)  return 'ahora';
    if (diffMin < 60) return `${diffMin}m`;
    if (diffH < 24)   return `${diffH}h`;
    if (diffD === 1)  return 'ayer';
    if (diffD < 7)    return `${diffD}d`;
    if (diffD < 30)   return `${Math.floor(diffD / 7)}sem`;
    return new Date(dateString).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
}
