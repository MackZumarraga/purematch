const luxon = require('luxon');

module.exports = (dateCreated) => {
    const dateToday = new Date().toISOString();

    const dateTodayConverted = luxon.DateTime.fromISO(dateToday);
    const dateCreatedConverted = luxon.DateTime.fromISO(dateCreated.toISOString());
    

    const diff = dateTodayConverted.diff(dateCreatedConverted, ["years", "months", "weeks", "days", "hours", "minutes", "seconds"]);

    const elapsedTimesObj = diff.toObject()

    let maxTimeKey = null;
    let maxTimeValue = 0;

    for (const [key, value] of Object.entries(elapsedTimesObj)) {
        if (value > maxTimeValue) {
            maxTimeValue = value
            maxTimeKey = key
            break
        }
    }
    
    return maxTimeValue.toString() + maxTimeKey;
}

