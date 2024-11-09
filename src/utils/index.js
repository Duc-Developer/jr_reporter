import dayjs from 'dayjs';

export const secondToHour = (seconds) => {
    if (!seconds) return 0;
    return (seconds / 3600).toFixed(2);
};

export const convertHeaders = (headerKeys) => {
    const headers = [
        { label: 'Summary', keys: [] },
        { label: 'Issue key', keys: [] },
        { label: 'Status', keys: [] },
        { label: 'Log Work', keys: [] },
        { label: 'Original Estimate', keys: [] },
        { label: 'Time Spent', keys: [] }
    ]
    headerKeys.forEach((key) => {
        const isLogWork = key.includes('Log Work');
        if (isLogWork) {
            headers[3].keys.push(key);
            return;
        }
        switch (key) {
            case 'Summary':
                headers[0].keys.push(key);
                break;
            case 'Issue key':
                headers[1].keys.push(key);
                break;
            case 'Status':
                headers[2].keys.push(key);
                break;
            case 'Original Estimate':
                headers[4].keys.push(key);
                break;
            case 'Time Spent':
                headers[5].keys.push(key);
                break;
            default:
                break;
        }
    });

    return headers;
};

export const generateChartConfigs = (headers, data, userMail) => {
    const results = {
        data: [],
        layout: {
            xaxis: {
                title: 'Log Work When (day/month)',
                tickangle: -45
            },
            yaxis: {
                title: 'hours'
            },
            barmode: 'stack',
            hovermode: 'closest'
        }
    }
    if (!headers.length || !data.length) return results;

    const logWorkData = [];
    const counters = {};
    let totalSeconds = 0;

    // Process data to extract date and seconds
    for (const row of data) {
        for (const header of headers) {
            if (header.label !== 'Log Work') continue;
            for (const key of header.keys) {
                const value = row[key];
                if (!value || value.trim() === '') continue;

                const { logWorkAt, logWorkBy, seconds: logSeconds } = parseLogWorkInfo(value);
                const isDifferentUser = userMail && logWorkBy && userMail.toLowerCase() !== logWorkBy.toLowerCase();
                if (!logWorkAt || !logWorkBy || !logSeconds || isDifferentUser) continue;
                const date = dayjs(logWorkAt, 'DD/MMM/YY h:mm A');
                const day = date.format('DD');
                const taskId = row["Issue key"];

                if (!counters[day]) {
                    counters[day] = 1;
                } else {
                    counters[day] += 1;
                }
                const seconds = parseInt(logSeconds, 10);
                totalSeconds += seconds;
                logWorkData.push({
                    original: logWorkAt,
                    date: day,
                    seconds,
                    month: date.month(),
                    year: date.year(),
                    taskId
                });
            }
        }
    }

    const totalCounterRecords = Object.keys(counters).length;
    const maxTrace = totalCounterRecords > 0
        ? counters[Object.keys(counters).reduce((a, b) => counters[a] > counters[b] ? a : b)]
        : 0;

    // Determine the month and year from the first log entry
    if (!logWorkData.length) return results;
    const { month: currentMonth, year: currentYear } = logWorkData[0];
    const daysInMonth = dayjs().month(currentMonth).year(currentYear).daysInMonth();
    const allDays = Array.from({ length: daysInMonth }, (_, i) => {
        const dayNumber = i + 1;
        const date = dayjs().month(currentMonth).year(currentYear).date(dayNumber);
        const day = date.day();
        let label = date.format('DD/MM');
        if (day === 0) label = `<span style="color:red">${date.format('dddDD')}</span>`;
        if (day === 6) label = `<span style="color:blue">${date.format('dddDD')}</span>`;
        return { id: dayNumber, label: label, day: date.day() };
    });

    const dataTrace = Array.from({ length: maxTrace }, (_, i) => {
        const yData = allDays.map(day => {
            const dayNumber = day.id;
            const logWorks = logWorkData.filter(item => item.date === dayNumber.toString());
            return secondToHour(logWorks[i]?.seconds);
        });
        return {
            x: allDays.map(day => day.label),
            y: yData,
            text: yData.map(value => `${value}h`),
            textposition: 'inside',
            type: 'bar',
            name: `Log Work ${i + 1}`,
            hovertemplate: allDays.map(day => {
                const dayNumber = day.id;
                const logWorks = logWorkData.filter(item => item.date === dayNumber.toString());
                const logWorkItem = logWorks[i];
                if (!logWorkItem) return '-';
                const fullDate = dayjs(logWorkItem.original).format('dddd HH:mm DD/MM/YYYY');
                return `<b>${fullDate}</b><br><b>Log</b>: %{y:.2f}h<extra><b>${logWorkItem.taskId}</b></extra>`;
            })
        };
    });

    const assignee = data[0]['Assignee'];
    results.layout.title = `<b>${secondToHour(totalSeconds)}h</b> log work`;
    if (assignee) {
        results.layout.title += ` of <b>${assignee}</b>`;
    }
    results.layout.title += ` in <b>${dayjs().month(currentMonth).year(currentYear).format('MM-YYYY')}</b>`;
    results.data = dataTrace ?? [];
    return results;
};

export const generateChartOverviewConfigs = (headers, allData) => {
    const results = {
        data: [],
        layout: {
            xaxis: {
                title: 'Assignee',
                tickangle: -45
            },
            yaxis: {
                title: 'hours'
            },
            barmode: 'group',
            hovermode: 'closest',
            margin: {
                t: 100,
                b: 150
            }
        }
    };
    if (!headers.length || !Object.keys(allData.group).length) return results;

    const assignees = Object.keys(allData.group);
    let totalLogWorkSeconds = 0;
    const logWorkData = assignees.map(assignee => {
        const rows = allData.group[assignee];
        let seconds = 0;

        for (const row of rows) {
            for (const header of headers) {
                if (header.label !== 'Log Work') continue;
                for (const key of header.keys) {
                    const value = row[key];
                    if (!value || value.trim() === '') continue;

                    const { logWorkAt, logWorkBy, seconds: logSeconds } = parseLogWorkInfo(value);
                    const isDifferentUser = logWorkBy && assignee.toLowerCase() !== logWorkBy.toLowerCase();
                    if (!logWorkAt || !logWorkBy || !logSeconds || isDifferentUser) continue;
                    seconds += parseInt(logSeconds, 10);
                }
            }
        }

        totalLogWorkSeconds += seconds;
        return {
            assignee,
            hours: secondToHour(seconds)
        };
    });

    results.data = [{
        x: logWorkData.map(item => item.assignee),
        y: logWorkData.map(item => item.hours),
        text: logWorkData.map(item => `${item.hours}h`),
        textposition: 'inside',
        type: 'bar',
        name: 'Log Work',
        hovertemplate: logWorkData.map(item => `<b>${item.assignee}</b><br><b>Log</b>: %{y:.2f}h<extra></extra>`),
        marker: {
            color: logWorkData.map((_, index) => {
                const colors = ["#FF0000", "#0000FF", "#008000", "#FFFF00", "#800080", "#FFA500", "#FFC0CB", "#A52A2A", "#808080", "#000000"];
                const brightness = 0.8; // Adjust brightness (0.0 - 1.0)
                const adjustBrightness = (hex, brightness) => {
                    const rgb = parseInt(hex.slice(1), 16);
                    const r = Math.min(255, Math.floor(((rgb >> 16) & 0xff) * brightness));
                    const g = Math.min(255, Math.floor(((rgb >> 8) & 0xff) * brightness));
                    const b = Math.min(255, Math.floor((rgb & 0xff) * brightness));
                    return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
                };
                return adjustBrightness(colors[index % colors.length], brightness);
            })
        },
    }];

    results.layout.title = `<b>${secondToHour(totalLogWorkSeconds)}h</b> log work of Team`;
    return results;
};

export const groupedCSVByAssignee = (data) => {
    const results = {
        headers: [],
        group: {}
    };
    if (!data?.data?.length) return results;
    results.headers = data.meta?.fields ?? [];
    for (const row of data.data) {
        const assignee = row['Assignee'];
        if (!assignee) continue;
        if (!results.group[assignee]) {
            results.group[assignee] = [];
        }
        results.group[assignee].push(row);
    }
    return results;
};

export const parseLogWorkInfo = (logWorkValue) => {
    if (!logWorkValue || logWorkValue.trim() === '') return {};
    const [original, logWorkAt, logWorkBy, seconds] = /(\d{2}\/\w{3}\/\d{2} \d{1,2}:\d{2} [APM]{2});(.*?);(\d+)/.exec(logWorkValue) ?? [];
    if (logWorkAt && logWorkBy && seconds) {
        return { original, logWorkAt, logWorkBy, seconds };
    } else {
        return {};
    }
};