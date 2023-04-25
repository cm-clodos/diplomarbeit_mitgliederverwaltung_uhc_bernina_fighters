export function formatInSwissTime(unformattedDate){
    let date = new Date(unformattedDate);
    const options = {timeZone: 'Europe/Zurich', year: 'numeric', month: '2-digit', day: '2-digit'};
    return date.toLocaleDateString('de-CH', options);
}

