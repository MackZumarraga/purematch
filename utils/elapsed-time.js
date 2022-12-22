const luxon = require('luxon');

module.exports = (dateCreated) => {
    const dateToday = new Date().toISOString();

    const dateTodayConverted = luxon.DateTime.fromISO(dateToday);
    const dateCreatedConverted = luxon.DateTime.fromISO(dateCreated.toISOString());

    const timeCategories = ["years", "months", "weeks", "days", "hours", "minutes", "seconds"]

    const diff = dateTodayConverted.diff(dateCreatedConverted, timeCategories);

    const elapsedTimesObj = diff.toObject()

    let maxTimeKey = null;
    let maxTimeValue = 0;


    for (const time of timeCategories) {
        let val = elapsedTimesObj[time]
        
        if (val > maxTimeValue) {
            maxTimeValue = val
            maxTimeKey = val > 1 ? time : time.slice(0, time.length - 1)
            break
        }
    }
    
    return maxTimeValue.toString() + maxTimeKey;
}

