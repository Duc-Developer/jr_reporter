import dayjs from 'dayjs';

export const secondToHour = (seconds) => {
    if (!seconds) return 0;
    return seconds / 3600;
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

export const generateChartConfigs = (headers, data) => {
    const results = {
        data: [],
        layout: {
            xaxis: {
                title: 'Date',
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

                const match = value.match(/(\d{2}\/\w{3}\/\d{2} \d{1,2}:\d{2} [APM]{2});.*?;(\d+)/);
                if (!match) continue;
                const date = dayjs(match[1], 'DD/MMM/YY h:mm A');
                const day = date.format('DD');
                const taskId = row["Issue key"];

                if (!counters[day]) {
                    counters[day] = 1;
                } else {
                    counters[day] += 1;
                }
                const seconds = parseInt(match[2], 10);
                totalSeconds += seconds;
                logWorkData.push({
                    original: match[1],
                    date: day,
                    seconds,
                    month: date.month(),
                    year: date.year(),
                    taskId
                });
            }
        }
    }

    const maxTrace = counters[Object.keys(counters).reduce((a, b) => counters[a] > counters[b] ? a : b)];

    // Determine the month and year from the first log entry
    if (!logWorkData.length) return;
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


    results.layout.title = `<b>${secondToHour(totalSeconds)}h</b> Log Work of <b>${dayjs().month(currentMonth).year(currentYear).format('MM-YYYY')}</b>`;
    results.data = dataTrace;
    return results;
};